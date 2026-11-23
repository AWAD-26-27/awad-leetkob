#include <cstring>
#include <ifaddrs.h>

int main() {
  ifaddrs* interfaces = nullptr;
  if (getifaddrs(&interfaces) != 0) return 1;

  bool loopback = false;
  bool has_other_interface = false;
  for (const ifaddrs* entry = interfaces; entry; entry = entry->ifa_next) {
    if (std::strcmp(entry->ifa_name, "lo") == 0) loopback = true;
    else has_other_interface = true;
  }
  freeifaddrs(interfaces);
  return loopback && !has_other_interface ? 0 : 1;
}
