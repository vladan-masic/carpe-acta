import type { Building } from './model';
/** Approved full-image percentages; front-center ground anchors. */
export type Placement = { building: Building; x: number; y: number; width: number; height: number; groundWidth: number; groundDepth: number; groundPolygon: number[][]; z: number };
export const placements: Placement[] = [
  {"building": "guild", "x": 14.5, "y": 24.5, "groundWidth": 12, "groundDepth": 5, "groundPolygon": [[14.5, 19.5], [20.5, 22.0], [14.5, 24.5], [8.5, 22.0]], "z": 2, "width": 12, "height": 13},
  {"building": "academy", "x": 46, "y": 23.5, "groundWidth": 13, "groundDepth": 5, "groundPolygon": [[46, 18.5], [52.5, 21.0], [46, 23.5], [39.5, 21.0]], "z": 1, "width": 13, "height": 13},
  {"building": "mine", "x": 90, "y": 29.5, "groundWidth": 12, "groundDepth": 5, "groundPolygon": [[90, 24.5], [96.0, 27.0], [90, 29.5], [84.0, 27.0]], "z": 3, "width": 12, "height": 12},
  {"building": "hall", "x": 48.5, "y": 38.5, "groundWidth": 18, "groundDepth": 4, "groundPolygon": [[48.5, 34.5], [57.5, 36.5], [48.5, 38.5], [39.5, 36.5]], "z": 4, "width": 18, "height": 9},
  {"building": "sawmill", "x": 18, "y": 49, "groundWidth": 14, "groundDepth": 6, "groundPolygon": [[18, 43], [25.0, 46.0], [18, 49], [11.0, 46.0]], "z": 5, "width": 14, "height": 13},
  {"building": "farm", "x": 78, "y": 49.5, "groundWidth": 12, "groundDepth": 4, "groundPolygon": [[78, 45.5], [84.0, 47.5], [78, 49.5], [72.0, 47.5]], "z": 6, "width": 12, "height": 8.5},
  {"building": "marketplace", "x": 45.5, "y": 58.5, "groundWidth": 14, "groundDepth": 4, "groundPolygon": [[45.5, 54.5], [52.5, 56.5], [45.5, 58.5], [38.5, 56.5]], "z": 7, "width": 14, "height": 8},
  {"building": "workshop", "x": 69.5, "y": 71.5, "groundWidth": 14, "groundDepth": 4.5, "groundPolygon": [[69.5, 67.0], [76.5, 69.25], [69.5, 71.5], [62.5, 69.25]], "z": 8, "width": 14, "height": 9.5},
  {"building": "quarry", "x": 18, "y": 75, "groundWidth": 14, "groundDepth": 7, "groundPolygon": [[18, 68], [25.0, 71.5], [18, 75], [11.0, 71.5]], "z": 9, "width": 14, "height": 12},
  {"building": "tavern", "x": 40, "y": 82.5, "groundWidth": 14, "groundDepth": 4.5, "groundPolygon": [[40, 78.0], [47.0, 80.25], [40, 82.5], [33.0, 80.25]], "z": 10, "width": 14, "height": 10},
];
export const terrainManifest = {
  "width": 1670,
  "height": 941,
  "river": [
    [
      71,
      23.5
    ],
    [
      68,
      25.5
    ],
    [
      66,
      29
    ],
    [
      69,
      32
    ],
    [
      77,
      36
    ],
    [
      84,
      38
    ],
    [
      91,
      42
    ],
    [
      89,
      47
    ],
    [
      84,
      51
    ],
    [
      79,
      55
    ],
    [
      79,
      58
    ],
    [
      84,
      62
    ],
    [
      89,
      66
    ],
    [
      88,
      70
    ],
    [
      83,
      76
    ],
    [
      74,
      81
    ],
    [
      65,
      81.5
    ],
    [
      57,
      80
    ],
    [
      52,
      85
    ],
    [
      43,
      89
    ],
    [
      31,
      95
    ],
    [
      18,
      100
    ]
  ],
  "bridge": [
    56.5,
    78.5
  ],
  "bridgeCorridor": [
    [
      49,
      71.5
    ],
    [
      52,
      71.5
    ],
    [
      64,
      84
    ],
    [
      61,
      86
    ]
  ]
} as const;
