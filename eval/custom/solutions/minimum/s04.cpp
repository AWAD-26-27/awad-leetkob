#include <algorithm>
#include <iostream>

#define PICK(a, b) std::min(a, b)
int main() {
    int a, b;
    std::cin >> a >> b;
    std::cout << PICK(a, b) << '\n';
}
