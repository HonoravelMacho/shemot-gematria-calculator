#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

//! Shemot Gematria — binario desktop.
//! SPDX-License-Identifier: Apache-2.0

fn main() {
    shemot_app_lib::run();
}
