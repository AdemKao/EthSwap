module.exports = {
  networks: {
    development: {
      host: "127.0.0.2",
      port: 8545,
      network_id: "*"
      },
    },
    contracts_directory: "./src/contracts",
    contracts_build_directory: "./src/abis",
    compilers: {
      solc: {
        optimizer: {
          enablee: true,
          runs: 200,
        },
        evmVersion: "petersburg",
      }
    }
}
