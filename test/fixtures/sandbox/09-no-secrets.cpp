#include <cstdlib>
#include <unistd.h>

#if __has_include(LEETKOB_TEST_CANARY)
#error the host canary is visible to the compiler
#endif

int main() {
  const char* proxy = std::getenv("HTTP_PROXY");
  if (std::getenv("GEMINI_API_KEY") || (proxy && *proxy)) return 1;
  sleep(1);
}
