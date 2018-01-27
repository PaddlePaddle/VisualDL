find_package(Sphinx)

set(SPHINX_THEME default)

set(LANG_LIST "en;cn")

foreach(LANG ${LANG_LIST})
    # configured documentation tools and intermediate build results
    set(BINARY_BUILD_DIR "${CMAKE_CURRENT_BINARY_DIR}/${LANG}/_build")

    # Sphinx cache with pickled ReST documents
    set(SPHINX_CACHE_DIR "${CMAKE_CURRENT_BINARY_DIR}/${LANG}/_doctrees")

    # HTML output director
    set(SPHINX_HTML_DIR "${CMAKE_CURRENT_BINARY_DIR}/${LANG}/html")

    configure_file(
        "${CMAKE_CURRENT_SOURCE_DIR}/templates/conf.py.${LANG}.in"
        "${BINARY_BUILD_DIR}/conf.py"
        @ONLY)

    sphinx_add_target(visualdl_docs_${LANG}
                      html
                      ${BINARY_BUILD_DIR}
                      ${SPHINX_CACHE_DIR}
                      ${CMAKE_CURRENT_SOURCE_DIR}
                      ${SPHINX_HTML_DIR})
    add_dependencies( visualdl_docs_${LANG} core )
endforeach()
