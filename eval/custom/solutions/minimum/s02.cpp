#include <algorithm>
#include <iostream>

namespace local {
int min(int a, int b) { return a < b ? a : b; }
}

int main() {
    int a, b;
    std::cin >> a >> b;
    std::cout << local::min(a, b) << '\n';
}
