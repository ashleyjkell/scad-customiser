/* [Text Settings] */

// Main name text
name_text = "ASHLEY";

// Subtitle or title text
subtitle_text = "Designer";

// Name font size in mm
name_font_size = 12; // [6:1:24]

// Subtitle font size in mm  
subtitle_font_size = 5; // [3:1:12]

// Text depth (how raised the text is)
text_depth = 1.5; // [0.5:0.1:3]

/* [Dimensions] */

// Sign width in mm
sign_width = 80; // [50:1:150]

// Sign height in mm
sign_height = 30; // [20:1:60]

// Base thickness in mm
base_thickness = 3; // [2:0.5:8]

// Corner radius in mm
corner_radius = 2; // [0:0.5:8]

/* [Base Stand] */

// Enable angled stand
enable_stand = true;

// Stand depth in mm
stand_depth = 30; // [15:1:50]

// Stand thickness in mm
stand_thickness = 3; // [2:0.5:6]

/* [Border] */

// Enable decorative border
enable_border = true;

// Border width in mm
border_width = 1.5; // [0.5:0.5:4]

// Border height in mm
border_height = 1; // [0.5:0.1:2]

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

// Base plate
translate([-sign_width/2, 0, 0])
    rounded_rect(sign_width, sign_height, base_thickness, corner_radius);

// Border frame
if (enable_border) {
    difference() {
        translate([-sign_width/2, 0, base_thickness])
            rounded_rect(sign_width, sign_height, border_height, corner_radius);
        translate([-sign_width/2 + border_width, border_width, base_thickness - 0.1])
            rounded_rect(sign_width - 2*border_width, sign_height - 2*border_width, border_height + 0.2, max(0, corner_radius - border_width));
    }
}

// Name text
name_y = sign_height * 0.55;
translate([0, name_y, base_thickness])
    linear_extrude(height = text_depth)
        text(name_text, size = name_font_size, halign = "center", valign = "center");

// Subtitle text
if (len(subtitle_text) > 0) {
    subtitle_y = sign_height * 0.22;
    translate([0, subtitle_y, base_thickness])
        linear_extrude(height = text_depth)
            text(subtitle_text, size = subtitle_font_size, halign = "center", valign = "center");
}

// Stand
if (enable_stand) {
    stand_angle = 75;
    translate([-sign_width/2, 0, 0])
        rotate([stand_angle, 0, 0])
            cube([sign_width, stand_depth, stand_thickness]);
}
