#ifndef VISUALDL_STORAGE_H
#define VISUALDL_STORAGE_H

class Storage {
 public:
  Storage& Global() {
    static Storage* instance = new Storage();
    return *instance;
  }
};

#endif //VISUALDL_STORAGE_H
