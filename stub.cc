#include <Python.h>

PyMODINIT_FUNC PyInit__foo() {
#if PY_MAJOR_VERSION >= 3
  return NULL;
#else
  return;
#endif
}
