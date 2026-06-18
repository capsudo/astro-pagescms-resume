{
  description = "Astro resume development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      supportedSystemNames = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      createOutputForEachSupportedSystem = nixpkgs.lib.genAttrs supportedSystemNames;
    in
    {
      devShells = createOutputForEachSupportedSystem (systemName:
        let
          packages = import nixpkgs {
            system = systemName;
          };
        in
        {
          default = packages.mkShell {
            packages = [
              packages.gh
              packages.git
              packages.netlify-cli
              packages.nodejs_24
            ];

            shellHook = ''
              # Keep Astro and npm state local or quiet.
              export ASTRO_TELEMETRY_DISABLED=1
              export NPM_CONFIG_FUND=false

              echo "Resume dev shell"
              echo "GitHub CLI: $(gh --version | head -n 1)"
              echo "Node: $(node --version)"
              echo "npm:  $(npm --version)"
              echo "Netlify: $(netlify --version)"
              echo ""
              echo "Run: npm install"
              echo "Run: npm run dev -- --host 127.0.0.1"
            '';
          };
        });
    };
}
