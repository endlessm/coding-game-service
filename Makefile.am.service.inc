if CODING_GAME_SERVICE_ENABLED

# Arbitrary files
arbitrary_files = \
	files/sw.txt \
	files/test.txt \
	files/classes.py \
	files/functions.py \
	files/processing.png \
	files/line.png \
	files/circle.png \
	files/circle_key.png \
	files/codeview-builder.png \
	files/builder-overview.png \
	files/codeview-icon.png \
	files/line_key.png \
	files/martian.png \
	files/martian_colors.png \
	files/coding-terminal.desktop \
	files/showmehow-terminal \
	files/line/line.pde \
	files/martian/martian.pde \
	files/wave/wave.pde \
	files/wave_mouse_interaction/wave_mouse_interaction.pde \
	files/wave_red/wave_red.pde \
	files/wave_red_mouse/wave_red_mouse.pde \
	files/wave_red_white_mouse/wave_red_white_mouse.pde \
	files/wave_25/wave_25.pde \
	files/wave-red.png \
	files/extension-todo.png \
	$(NULL)

nobase_files_DATA = $(arbitrary_files)

# Resource javascript modules
resource_dist_js_files = \
	lib/controller.js \
	lib/communicator.js \
	lib/desktopFile.js \
	lib/log.js \
	lib/service.js \
	lib/validation.js \
	lib/shellAppStore.js \
	$(NULL)

resource_nondist_js_files = \
	lib/config.js \
	$(NULL)

lib/config.js: $(srcdir)/lib/config.js.in
	$(AM_V_GEN) mkdir -p lib/ && \
	sed -e 's,%CODING_FILES_DIR%,$(pkgdatadir)/files,g' \
	    -e 's,%CODING_COPY_FILES_SCRIPT%,$(pkgdatadir)/coding-copy-files,g' \
	$< > $@.tmp && \
	mv -f $@.tmp $@

# Mocks
javascript_mocks = \
	mocks/constructors.js \
	$(NULL)

# Tests
javascript_tests = \
	tests/js/testCodingGameService.js \
	tests/js/testCodingGameServiceTimeline.js \
	$(NULL)

# All javascript modules
all_dist_js_files = \
	bin/coding-game-validator.js \
	bin/coding-game-service.js.in \
	bin/edit-desktop-file.js \
	$(javascript_mocks) \
	$(javascript_tests) \
	$(resource_dist_js_files) \
	$(NULL)

all_js_files = \
	$(all_dist_js_files) \
	$(resource_nondist_js_files) \
	$(NULL)

# Validation of timeline (produces data.timeline)
data/timeline.json: $(srcdir)/data/timeline.json.unvalidated.in $(all_js_files)
	mkdir -p data
	cp $< $@

# GResources
resource_files = \
	$(resource_dist_js_files) \
	$(resource_nondist_js_files) \
	data/timeline.json \
	$(NULL)

resource_DATA += com.endlessm.CodingGameService.gresource

com.endlessm.CodingGameService.gresource: $(srcdir)/com.endlessm.CodingGameService.gresource.xml $(resource_files)
	$(AM_V_GEN) glib-compile-resources --target=$@ --sourcedir=$(srcdir) --sourcedir=$(builddir) $<

# Scripts to install
bin_SCRIPTS += \
	coding-game-service \
	coding-game-validator \
	$(NULL)

coding-game-service: $(srcdir)/bin/coding-game-service.js.in
	$(AM_V_GEN) sed -e 's,%PKGDATADIR%,$(pkgdatadir),g' $< > $@.tmp && mv -f $@.tmp $@
	chmod +x $@

coding-game-validator: $(srcdir)/bin/coding-game-validator.js
	cp $< $@
	chmod +x $@

# DBus Service
servicedir = $(datadir)/dbus-1/services
service_DATA = com.endlessm.CodingGameService.service

com.endlessm.CodingGameService.service: $(srcdir)/com.endlessm.CodingGameService.service.in
	$(AM_V_GEN) sed -e 's|@bindir[@]|${bindir}|g' $< > $@

#  Run tests when running 'make check'
TESTS = \
	$(javascript_tests) \
	run_coverage.coverage \
	run_eslint.eslint
	$(NULL)
LOG_COMPILER = gtester
AM_LOG_FLAGS = -k --verbose

JS_LOG_DRIVER = env AM_TAP_AWK='$(AWK)' $(SHELL) $(top_srcdir)/tap-driver.sh
JS_LOG_DRIVER_FLAGS = --comments
JS_LOG_COMPILER = jasmine
AM_JS_LOG_FLAGS = --tap --no-config @JASMINE_REPORT_ARGUMENT@

# Use locally built versions of CodingGameService-1.0.gir, JS modules, and
# libraries. We clobber GJS_PATH and include the js directory and the
# $(top_srcdir) for including test helper files.
# (May need to change to AM_TESTS_ENVIRONMENT in a later version of Automake)
TESTS_ENVIRONMENT = \
	export GJS_PATH="$(top_srcdir):$(top_srcdir)/lib"; \
	export GI_TYPELIB_PATH="$(top_builddir)$${GI_TYPELIB_PATH:+:$$GI_TYPELIB_PATH}"; \
	export LD_LIBRARY_PATH="$(top_builddir)/.libs$${LD_LIBRARY_PATH:+:$$LD_LIBRARY_PATH}"; \
	export G_TEST_SRCDIR="$(abs_srcdir)/tests"; \
	export G_TEST_BUILDDIR="$(abs_builddir)/tests"; \
	export LC_ALL=C; \
	$(NULL)

# # # COVERAGE # # #

# Don't specify the resource:/// URIs here, because the tests load modules from
# the local directory, not from the GResource
EOS_JS_COVERAGE_FILES := $(patsubst $(srcdir)/%,%,$(wildcard $(srcdir)/lib/*.js))

@EOS_COVERAGE_RULES@

AM_JS_LOG_FLAGS += @EOS_JS_COVERAGE_LOG_FLAGS@

# # # LINTING # # #
EOS_ESLINT_FILES := $(all_js_files)

@EOS_ESLINT_RULES@

# Things to get rid of later
CLEANFILES += \
	$(bin_SCRIPTS) \
	$(service_DATA) \
	com.endlessm.CodingGameService.gresource \
	data/timeline.json \
	lib/config.js \
	$(NULL)
EXTRA_DIST += \
	com.endlessm.CodingGameService.service.in \
	com.endlessm.CodingGameService.gresource.xml \
	data/timeline.json.unvalidated.in \
	lib/config.js.in \
	jasmine.json \
	$(all_dist_js_files) \
	$(arbitrary_files) \
	$(NULL)

endif
