#include <unistd.h>

int main() {
  return getuid() == 10001 && geteuid() == 10001 ? 0 : 1;
}
