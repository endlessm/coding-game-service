// lib/communicator.js
//
// Copyright (c) 2016-2017 Endless Mobile Inc.
//
// The communicator module is responsible for communicating messgaes to and from
// this service to other services, such as the chatbox itself.

const ChatboxService = imports.gi.ChatboxService;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Config = imports.lib.config;
const ShellAppStore = imports.lib.shellAppStore;

// eslint-disable-next-line no-unused-vars
var CodingGameServiceChatController = new Lang.Class({
    Name: 'CodingGameServiceChatController',

    _init: function() {
        try {
            this._internalChatboxProxy =
                ChatboxService.CodingChatboxProxy.new_for_bus_sync(Gio.BusType.SESSION,
                                                                   Gio.DBusProxyFlags.DO_NOT_AUTO_START_AT_CONSTRUCTION,
                                                                   'com.endlessm.CodingChatbox',
                                                                   '/com/endlessm/CodingChatbox',
                                                                   null);
        } catch (e) {
            logError(e, 'Error occurred in connecting to com.endlesssm.CodingChatbox');
        }
    },

    sendChatMessage: function(message) {
        let serialized = JSON.stringify(message);
        this._internalChatboxProxy.call_receive_message(serialized, null, Lang.bind(this, function(source, result) {
            try {
                this._internalChatboxProxy.call_receive_message_finish(result);
            } catch (e) {
                logError(e,
                         'Failed to send message to chatbox (' +
                         JSON.stringify(message, null, 2) + ')');
            }
        }));
    },

    reset: function() {
        this._internalChatboxProxy.call_reset(null, Lang.bind(this, function(source, result) {
            try {
                this._internalChatboxProxy.call_reset_finish(result);
            } catch (e) {
                logError(e, 'Failed to reset conversation state');
            }
        }));
    }
});

// executeCommandForOutput
//
// Shell out to some process and get its output. If the process
// returns a non-zero exit status, throw.
function executeCommandForOutput(argv) {
    let stdout, stderr;
    stdout = stderr = '';

    try {
        let spawnResult = GLib.spawn_sync(null,
                                          argv,
                                          null,
                                          GLib.SpawnFlags.SEARCH_PATH,
                                          null);
        let [procStdOut, procStdErr, status] = spawnResult.slice(1);
        stdout = procStdOut;
        stderr = procStdErr;

        // Check the exit status to see if the process failed. This will
        // throw an exception if it did.
        GLib.spawn_check_exit_status(status);

        return {
            status: status,
            stdout: String(procStdOut),
            stderr: String(procStdErr)
        };
    } catch (e) {
        throw new Error('Failed to execute ' + argv.join(' ') + ': ' +
                        [String(e), String(stdout), String(stderr)].join('\n'));
    }
}

// copySourceToTarget
//
// This function will copy a file from the coding_files_dir to a given target path.
// If the user has write permissions for that path (eg, it is within the home
// directory, we write it there directly. Otherwise, we shell out to pkexec and
// another script to copy to another (whitelisted) location.
function copySourceToTarget(source, target) {
    let targetFile = Gio.File.parse_name(target);

    // We have permission to copy this file.
    if (targetFile.has_prefix(Gio.File.new_for_path(GLib.get_home_dir()))) {
        let sourcePath = GLib.build_filenamev([
            Config.coding_files_dir,
            source
        ]);
        let sourceFile = Gio.File.new_for_path(sourcePath);

        try {
            let targetDir = targetFile.get_parent();
            targetDir.make_directory_with_parents(null);
        } catch (e) {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.EXISTS)) {
                throw e;
            }
        }

        sourceFile.copy(targetFile, Gio.FileCopyFlags.OVERWRITE, null, null);
    } else {
        // We do not have permission to copy this file. Shell out to
        // the coding-copy-files script through pkexec and take the result
        // from there.
        executeCommandForOutput([
            'flatpak-spawn',
            '--host',
            'pkexec',
            Config.coding_copy_files_script,
            source,
            target
        ]);
    }
}

// checkSettingsForKey
//
// Check to make sure that the settings object passed has the specified
// key in its schema.
function checkSettingsForKey(settings, key) {
    if (settings.settings_schema.list_keys().indexOf(key) === -1) {
        throw new Error('schema ' + settings.schema_id + ' has no key ' + key);
    }
}

// ExternalEffects
//
// This class manages CodingGameService's interaction with the outside
// world, for instance, changing settings, copying files or adding
// events to the main loop.
//
// It exists as a separate class so that it can be replaced in testing
// scenarios.
//
// eslint-disable-next-line no-unused-vars
var ExternalEffects = new Lang.Class({
    Name: 'ExternalEffects',

    _init: function() {
        this._shellProxy = new ShellAppStore.ShellAppStore();

        // Maps event names to timeouts.
        this._activeTimeouts = {};
    },

    addApplication: function(app) {
        this._shellProxy.proxy.AddApplicationRemote(app);
    },

    removeApplication: function(app) {
        this._shellProxy.proxy.RemoveApplicationRemote(app);
    },

    removeFile: function(targetPath) {
        let file = Gio.File.parse_name(targetPath);
        if (file.query_exists(null)) {
            file.delete(null);
        }
    },

    performEventIn: function(name, timeout, callback) {
        // Calling this function with a name that already has an existing
        // timeout will clobber the old timeout and add the new one. We
        // explicitly remove the old timeout in that case.
        let existingId = this._activeTimeouts[name];
        if (existingId) {
            GLib.source_remove(existingId);
        }

        let onTimeout = Lang.bind(this, function() {
            delete this._activeTimeouts[name];
            callback();
        });
        this._activeTimeouts[name] = GLib.timeout_add(GLib.PRIORITY_DEFAULT,
                                                      timeout,
                                                      onTimeout);
    },

    // cancelPendingEvent
    //
    // Cancels a pending event by name. Use this for when you know the name
    // of an event to cancel and you need to do something after it has
    // been cancelled. It is a programmer error to call this function
    // with an event that is not pending.
    cancelPendingEvent: function(name) {
        let eventId = this._activeTimeouts[name];
        if (!eventId) {
            throw new Error('No such pending event: ' + name);
        }

        GLib.source_remove(eventId);
        delete this._activeTimeouts[name];
    },

    // cancelAllPendingEvents
    //
    // Cancels all remaining  pending events, regardless of what their names
    // were. Use this when you don't know what events you have to cancel and
    // you don't care what got cancelled.
    cancelAllPendingEvents: function() {
        Object.keys(this._activeTimeouts).forEach(Lang.bind(this, function(name) {
            let eventId = this._activeTimeouts[name];
            GLib.source_remove(eventId);
        }));
        this._activeTimeouts = {};
    },

    _getSettingsForSchema: function(schema) {
        let source = Gio.SettingsSchemaSource.get_default();
        let settings_schema = source.lookup(schema, true);

        // We first do some introspection on the schema to make sure that we can
        // change the value as intended and don't get aborted when we try to
        if (!settings_schema) {
            throw new Error('no such schema ' + schema);
        }

        return new Gio.Settings({ settings_schema: settings_schema });
    },

    // It isn't ideal that we have to call _getSettingsForSchema here
    // each time, but we can't reliably get the schema during tests
    // due to potentially uninstalled dependencies
    changeGSettingsValue: function(schema, key, value) {
        let settings = this._getSettingsForSchema(schema);
        checkSettingsForKey(settings, key);
        return settings.set_value(key, value);
    },

    fetchGSettingsValue: function(schema, key) {
        // Variant is unused here, but we use it in the tests
        // to construct a placeholder
        let settings = this._getSettingsForSchema(schema);
        checkSettingsForKey(settings, key);
        return settings.get_value(key).deep_unpack();
    },

    resetGSettingsValue: function(settings, key) {
        settings.reset(key);
    },

    copySourceToTarget: function(source, target) {
        copySourceToTarget(source, target);
    }
});

