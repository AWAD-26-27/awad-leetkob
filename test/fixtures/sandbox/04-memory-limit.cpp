#include <cstdio>
#include <fstream>
#include <numeric>
#include <vector>

int main() {
  int swap_limit = -1;
  std::ifstream("/sys/fs/cgroup/memory.swap.max") >> swap_limit;
  if (swap_limit != 0) return 1;

  const std::vector<unsigned char> bytes(270u * 1024 * 1024, 1);
  const auto sum = std::accumulate(bytes.begin(), bytes.end(), 0ul);
  std::printf("%lu\n", sum);
}
