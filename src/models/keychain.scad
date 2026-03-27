/* [Text Settings] */

// The text to display on the keychain
text = "HELLO";

// Font size in mm
font_size = 8; // [4:1:20]

// Text depth (how raised the text is)
text_depth = 1.5; // [0.5:0.1:3]

/* [Dimensions] */

// Total width in mm
width = 50; // [30:1:80]

// Total height in mm
height = 20; // [15:1:40]

// Base thickness in mm
thickness = 3; // [2:0.5:6]

// Corner radius in mm
corner_radius = 3; // [0:0.5:10]

/* [Keyring Hole] */

// Enable keyring hole
enable_hole = true;

// Hole diameter in mm
hole_diameter = 5; // [3:0.5:8]

// Distance of hole center from edge
hole_offset = 6; // [4:0.5:12]

/* [Hidden] */
$fn = 48;

module rounded_rect(w, h, t, r) {
    if (r > 0) {
        hull() {
            for (x = [r, w - r]) {
                for (y = [r, h - r]) {
                    translate([x, y, 0])
                        cylinder(h = t, r = r);
                }
            }
        }
    } else {
        cube([w, h, t]);
    }
}

// Main body
difference() {
    // Base plate
    translate([-width/2, -height/2, 0])
        rounded_rect(width, height, thickness, corner_radius);

    // Keyring hole
    if (enable_hole) {
        translate([width/2 - hole_offset, 0, -1])
            cylinder(h = thickness + 2, d = hole_diameter);
    }
}

// Raised text
text_x_offset = enable_hole ? -(hole_offset / 2) : 0;
translate([text_x_offset, 0, thickness])
    linear_extrude(height = text_depth)
        text(text, size = font_size, font = "/fonts/LiberationSans-Regular.ttf", halign = "center", valign = "center");
