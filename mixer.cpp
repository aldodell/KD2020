#include "mixer.h"

int main(int argc, char *argv[]) {

  if (argc == 1) {
    cout << "Usage: mixer outfile infile1 infile2 infile3 ...." << endl;
    exit(0);
  }

  char *outputfile = argv[1];
  ofstream ofs(outputfile, ios_base::out | ios_base::binary);

  constexpr size_t bufSize = 256;
  char buffer[bufSize];

  for (int i = 1; i < argc; i++) {
    ifstream ifs(argv[i], ios_base::in | ios_base::binary);
    if (ifs.is_open()) {
      while (!ifs.eof()) {
        ifs.read(buffer, sizeof(buffer));
        ofs.write(buffer, ifs.gcount());
      }
      ifs.close();
    }
  }
  ofs.close();
  exit(0);
}
