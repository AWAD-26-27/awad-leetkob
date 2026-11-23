#include <algorithm>
#include <iostream>

#define UNUSED(a, b) std::min(a, b)
int main() {
    int a, b;
    std::cin >> a >> b;
#if 0
    return std::min(a, b);
#endif
    std::cout << (a < b ? a : b) << '\n';
}
