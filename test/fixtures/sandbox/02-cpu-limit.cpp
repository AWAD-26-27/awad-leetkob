#include <cstdio>
#include <ctime>

int main() {
  std::fputs("started\n", stderr);
  const std::clock_t started = std::clock();
  while (std::clock() - started < 4 * CLOCKS_PER_SEC) {}
}
