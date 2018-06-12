if CODING_GAME_INTEGRATION_ENABLED

bin_SCRIPTS += \
	coding-dev-reset \
	coding-terminal \
	$(NULL)

coding-dev-reset: $(srcdir)/bin/coding-dev-reset
	cp $< $@
	chmod +x $@

coding-terminal: $(srcdir)/bin/coding-terminal.in
	$(AM_V_GEN) $(SED) -e 's,%pkgdatadir%,$(pkgdatadir),g' < $< >$@.tmp && \
	mv -f $@.tmp $@ && \
	chmod +x $@

# Script for placing files in the shared dir
pkgdata_SCRIPTS = files/coding-copy-files

files/coding-copy-files: files/coding-copy-files.js.in
	$(AM_V_GEN) mkdir -p files && \
	$(SED) -e 's,%coding_files_dir%,$(pkgdatadir)/files,g' < $< >$@.tmp && \
	mv -f $@.tmp $@ && \
	chmod +x $@

# Polkit policy
polkit_policy_DATA += com.endlessm.Coding.policy

com.endlessm.Coding.policy: com.endlessm.Coding.policy.in
	$(AM_V_GEN) mkdir -p data && \
	$(SED) -e 's,%pkgdatadir%,$(pkgdatadir),' < $< >$@.tmp && \
	mv -f $@.tmp $@

# Things to get rid of later
CLEANFILES += \
	$(bin_SCRIPTS) \
	$(polkit_policy_DATA) \
	files/coding-copy-files \
	$(NULL)
EXTRA_DIST += \
	bin/coding-dev-reset \
	bin/coding-terminal.in \
	com.endlessm.Coding.policy.in \
	files/coding-copy-files.js.in \
	$(NULL)

endif
