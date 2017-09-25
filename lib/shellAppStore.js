// lib/shellAppStore.js
//
// Copyright (c) 2016-2017 Endless Mobile Inc.
//
// Helper methods to modify the desktop layout on gnome-shell.

const Gio = imports.gi.Gio;
const Lang = imports.lang;

const AppStoreIface = '<node>' +
'<interface name="org.gnome.Shell.AppStore">' +
'<method name="AddApplication">' +
  '<arg type="s" direction="in" name="id"/>' +
'</method>' +
'<method name="RemoveApplication">' +
  '<arg type="s" direction="in" name="id"/>' +
'</method>' +
'<method name="ListApplications">' +
  '<arg type="as" direction="out" name="applications"/>' +
'</method>' +
'<method name="AddFolder">' +
  '<arg type="s" direction="in" name="id"/>' +
'</method>' +
'<method name="RemoveFolder">' +
  '<arg type="s" direction="in" name="id"/>' +
'</method>' +
'<method name="ResetDesktop"></method>' +
'<signal name="ApplicationsChanged">' +
  '<arg type="as" name="applications"/>' +
'</signal>' +
'</interface>' +
'</node>';

const SHELL_APP_STORE_NAME = 'org.gnome.Shell';
const SHELL_APP_STORE_PATH = '/org/gnome/Shell';
// eslint-disable-next-line no-unused-vars
const SHELL_APP_STORE_IFACE = 'org.gnome.Shell.AppStore';

const ShellAppStoreProxy = Gio.DBusProxy.makeProxyWrapper(AppStoreIface);

// eslint-disable-next-line no-unused-vars
const ShellAppStore = new Lang.Class({
    Name: 'ShellAppStore',

    _init: function() {
        this.proxy = new ShellAppStoreProxy(Gio.DBus.session,
            SHELL_APP_STORE_NAME, SHELL_APP_STORE_PATH,
            Lang.bind(this, this._onProxyConstructed));
    },

    _onProxyConstructed: function() {
        // do nothing
    }
});
