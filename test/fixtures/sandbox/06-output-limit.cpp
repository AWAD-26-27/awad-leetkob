#include <cstdio>

int main() {
  for (int i = 0; i < 180; ++i) {
    std::fputs("12345678", stdout);
    std::fputs("12345678", stderr);
  }
}
