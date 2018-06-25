lib_LTLIBRARIES =
bin_SCRIPTS =
filesdir = $(pkgdatadir)
files_DATA =
girdir = $(datadir)/gir-1.0
gir_DATA =
polkit_policydir = $(datadir)/polkit-1/actions
polkit_policy_DATA =
resourcedir = $(pkgdatadir)
resource_DATA =
typelibdir = $(libdir)/girepository-1.0
typelib_DATA =

BUILT_SOURCES =
CLEANFILES =
EXTRA_DIST =

# GObject-Introspection support
include $(INTROSPECTION_MAKEFILE)
INTROSPECTION_GIRS = $(NULL)
INTROSPECTION_SCANNER_ARGS = --add-include-path=$(srcdir) --warn-all
INTROSPECTION_COMPILER_ARGS = --includedir=$(srcdir)

# Make sure to pass the enable/disable switches to distcheck
AM_DISTCHECK_CONFIGURE_FLAGS = \
	$(ADDITIONAL_DISTCHECK_CONFIGURE_FLAGS) \
	--enable-introspection \
	$(NULL)

if EOS_ENABLE_COVERAGE
AM_DISTCHECK_CONFIGURE_FLAGS += --enable-coverage --with-coverage-dir=@EOS_COVERAGE_DIR@
endif EOS_ENABLE_COVERAGE

# Cannot have conditional contents, need to put it out here
TEST_EXTENSIONS = .js .coverage .eslint

include $(top_srcdir)/Makefile.am.service.inc
include $(top_srcdir)/Makefile.am.integration.inc

# Generate the CodingGameService GDBus Skeleton library
CodingGameService.c: $(srcdir)/com.endlessm.CodingGameService.xml
	gdbus-codegen --generate-c-code CodingGameService --c-namespace CodingGameService --c-generate-object-manager --interface-prefix com.endlessm. $<

CodingGameService.h: CodingGameService.c

gdbus_codegen_built_sources = CodingGameService.c CodingGameService.h
coding_game_integration_shim_sources = lib/shim.c lib/shim.h

BUILT_SOURCES += $(gdbus_codegen_built_sources)
EXTRA_DIST += $(srcdir)/com.endlessm.CodingGameService.xml

libcoding_game_service_1_0_la_SOURCES = \
	$(gdbus_codegen_built_sources) \
	$(coding_game_integration_shim_sources) \
	$(NULL)
libcoding_game_service_1_0_la_CFLAGS = $(CODING_GAME_SERVICE_CFLAGS)
libcoding_game_service_1_0_la_LIBADD = $(CODING_GAME_SERVICE_LIBS)

# All libraries
lib_LTLIBRARIES += libcoding_game_service-1.0.la

# Header files to install
coding_game_serviceincludedir = $(includedir)/coding-game-service
nobase_coding_game_serviceinclude_HEADERS = \
	CodingGameService.h

# Introspection
if HAVE_INTROSPECTION
CodingGameService-1.0.gir: libcoding_game_service-1.0.la
CodingGameService_1_0_gir_INCLUDES = GObject-2.0 Gio-2.0
CodingGameService_1_0_gir_CFLAGS = $(INCLUDES)
CodingGameService_1_0_gir_LIBS = libcoding_game_service-1.0.la
CodingGameService_1_0_gir_FILES = $(libcoding_game_service_1_0_la_SOURCES)

INTROSPECTION_GIRS += CodingGameService-1.0.gir
endif

gir_DATA += $(INTROSPECTION_GIRS)
typelib_DATA += $(INTROSPECTION_GIRS:.gir=.typelib)

CLEANFILES += $(gir_DATA) $(typelib_DATA)
