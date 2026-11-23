#include <fstream>

int main() {
  int process_limit = 0;
  std::ifstream("/sys/fs/cgroup/pids.max") >> process_limit;
  return process_limit == 64 ? 0 : 1;
}
