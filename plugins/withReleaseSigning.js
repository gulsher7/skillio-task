const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Teaches the generated Android project how to sign a release build.
 *
 * `android/` is generated (CNG) and gitignored, so editing its Gradle by hand
 * would be undone by the next prebuild. This runs at prebuild instead, which
 * means the signing config is part of the project's configuration rather than
 * a local edit somebody has to remember to redo.
 *
 * No secrets live here. The keystore path and passwords arrive as Gradle
 * properties — `scripts/release-apk.sh` passes them with `-P` — and if they are
 * absent the build falls back to the debug key, so a plain `assembleRelease`
 * still works for anyone who just wants to run it.
 */
const SIGNING_CONFIG = `
        release {
            if (project.hasProperty('SKILLIO_STORE_FILE')) {
                storeFile file(project.property('SKILLIO_STORE_FILE'))
                storePassword project.property('SKILLIO_STORE_PASSWORD')
                keyAlias project.property('SKILLIO_KEY_ALIAS')
                keyPassword project.property('SKILLIO_KEY_PASSWORD')
            }
        }
`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;

    if (gradle.includes('SKILLIO_STORE_FILE')) return cfg;

    // Add a `release` signing config alongside the generated `debug` one.
    gradle = gradle.replace(
      /(signingConfigs \{\n)/,
      `$1${SIGNING_CONFIG}`,
    );

    // Point the release build type at it, but only when a keystore was passed.
    gradle = gradle.replace(
      /(buildTypes \{[\s\S]*?release \{\n)([\s\S]*?)signingConfig signingConfigs\.debug/,
      `$1$2signingConfig project.hasProperty('SKILLIO_STORE_FILE') ? signingConfigs.release : signingConfigs.debug`,
    );

    cfg.modResults.contents = gradle;
    return cfg;
  });
};
