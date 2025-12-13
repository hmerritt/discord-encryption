import { patchBuild } from "./build-lib";

(async () => {
    await patchBuild();
    process.exit(0);
})();
