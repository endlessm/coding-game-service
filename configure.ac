#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ([2.69])
AC_INIT([com.endlessm.CodingGameService],
        [0.0.0],
        [https://phabricator.endlessm.com],
        [com.endlessm.CodingGameService],
        [http://www.endlessm.com])
AM_INIT_AUTOMAKE([1.12 dist-xz no-dist-gzip foreign tar-ustar subdir-objects parallel-tests])
AM_SILENT_RULES([yes])

# Custom macros
AC_CONFIG_MACRO_DIRS([m4])

# Set up libtool
LT_INIT

# Set up GObject-Introspection
GOBJECT_INTROSPECTION_CHECK([1.30.0])

# Checks for programs.
AC_PROG_AWK  # needed for TAP driver
AC_PROG_SED  # needed for finding files for coverage
AC_REQUIRE_AUX_FILE([tap-driver.sh])

# Checks for libraries.
PKG_CHECK_MODULES(CODING_GAME_SERVICE, [glib-2.0 gio-2.0 gobject-2.0 gio-unix-2.0])

ADDITIONAL_DISTCHECK_CONFIGURE_FLAGS=""

AC_ARG_ENABLE([service], [coding desktop service], [
  CODING_GAME_SERVICE_ENABLED=$enableval
], [
  CODING_GAME_SERVICE_ENABLED=yes
])
AM_CONDITIONAL([CODING_GAME_SERVICE_ENABLED], [test "x$CODING_GAME_SERVICE_ENABLED" = "xyes"])

AC_ARG_ENABLE([integration], [coding OS integration], [
  CODING_GAME_INTEGRATION_ENABLED=$enableval
], [
  CODING_GAME_INTEGRATION_ENABLED=no
])
AM_CONDITIONAL([CODING_GAME_INTEGRATION_ENABLED], [test "x$CODING_GAME_INTEGRATION_ENABLED" = "xyes"])

AS_IF([test "x$CODING_GAME_SERVICE_ENABLED" = "xyes"], [
  ADDITIONAL_DISTCHECK_CONFIGURE_FLAGS="$ADDITIONAL_DISTCHECK_CONFIGURE_FLAGS --enable-service"
], [
  ADDITIONAL_DISTCHECK_CONFIGURE_FLAGS="$ADDITIONAL_DISTCHECK_CONFIGURE_FLAGS --disable-service"
])

AS_IF([test "x$CODING_GAME_INTEGRATION_ENABLED" = "xyes"], [
  ADDITIONAL_DISTCHECK_CONFIGURE_FLAGS="$ADDITIONAL_DISTCHECK_CONFIGURE_FLAGS --enable-integration"
], [
  ADDITIONAL_DISTCHECK_CONFIGURE_FLAGS="$ADDITIONAL_DISTCHECK_CONFIGURE_FLAGS --disable-integration"
])

AC_SUBST([ADDITIONAL_DISTCHECK_CONFIGURE_FLAGS])

# Checks for header files.

# Checks for typedefs, structures, and compiler characteristics.

# Checks for library functions.

# JASMINE_JUNIT_REPORTS_DIR: Where to put test reports
AC_MSG_CHECKING([where to put test reports])
AC_ARG_VAR([JASMINE_JUNIT_REPORTS_DIR], [Where to put test reports])
AS_IF([test -n "$JASMINE_JUNIT_REPORTS_DIR"],
    [JASMINE_REPORT_ARGUMENT="--junit $JASMINE_JUNIT_REPORTS_DIR/\$\${log/%.log/.js.xml}"
    AC_MSG_RESULT([in $JASMINE_JUNIT_REPORTS_DIR])],
    [JASMINE_REPORT_ARGUMENT=
    AC_MSG_RESULT([nowhere])])
AC_SUBST([JASMINE_REPORT_ARGUMENT])

# Code Coverage
# -------------
EOS_COVERAGE_REPORT([js])

# Linting
# -------
EOS_ESLINT

# Substitute variables
AC_CONFIG_FILES([Makefile])
AC_OUTPUT

echo "
        Build OS integration:    ${CODING_GAME_INTEGRATION_ENABLED}
        Build service:           ${CODING_GAME_SERVICE_ENABLED}

"
