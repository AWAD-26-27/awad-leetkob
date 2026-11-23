#include <cerrno>
#include <sys/stat.h>
#include <unistd.h>

int main() {
  struct stat info {};
  if (lstat("/var/run/docker.sock", &info) != -1 || errno != ENOENT) return 1;
  sleep(1);
}
