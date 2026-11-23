#include <cstdio>
#include <unistd.h>

int main() {
  std::fputs("started\n", stderr);
  sleep(6);
}
