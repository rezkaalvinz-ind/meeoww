# Audio sources

The demo player now uses the five MP3 files added to the project root:

- `33x - Perunggu Lirik Lagu.mp3`
- `Love Me Not - Ravyn Lenae Lirik Terjemahan Indonesia.mp3`
- `Rex Orange County - Best Friend (Official Audio).mp3`
- `The 1975 - About You (Official).mp3`
- `What If I Call - Alex Crichton Lirik Terjemahan Indonesia.mp3`

The backend exposes these local files through `/media/<filename>` and supports byte-range requests so the browser can load metadata and seek through the track. The frontend URL-encodes each filename because the names contain spaces and punctuation.

The files are used as the example audio collection in the local development project. Confirm that the project has permission to distribute any copyrighted recordings before deploying the app publicly.
