import { getProfileAction } from "./packages/core/src/features/marketplace/actions/profile.action";

process.env.NEXT_PUBLIC_USE_MOCK = 'true';

async function test() {
    console.log("Running profile action test...");
    const res = await getProfileAction();
    console.log("Result:", res);
}

test().catch(console.error);
