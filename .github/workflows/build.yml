name: Typescript Client CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22.x]
    steps:
    - name: Checkout
      uses: actions/checkout@v4
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'pnpm'
        cache-dependency-path: pnpm-lock.json
    - name: Install dependencies
      run: pnpm install
    - name: Run lint
      run: pnpm run lint
    - name: Run build
      run: pnpm run build