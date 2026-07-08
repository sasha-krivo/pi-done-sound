# Done Sound

A [pi](https://pi.dev) extension that plays a notification sound on macOS when the agent finishes processing a prompt.

## Install

```bash
pi install git:github.com/sasha-krivo/pi-done-sound@v0.1.0
```

Or from a local path during development:

```bash
pi install /path/to/pi-done-sound
```

## Usage

No configuration needed — the default `Glass` sound plays on every `agent_end` event.

### Customizing the sound

Set the `DONE_SOUND` environment variable to change which sound plays. You can use one of the built-in sound names or a path to an audio file.

```bash
# macOS built-in sound name
DONE_SOUND=Ping pi

# Custom audio file (absolute or relative path)
DONE_SOUND=/path/to/custom.wav pi
```

**Built-in sound names (case-insensitive, do not add .aiff):** Glass, Blow, Basso, Bottle, Frog, Funk, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink.

**Default:** Glass.

### One-off use without installing

```bash
pi -e /path/to/pi-done-sound/extensions/index.ts
```

## How it works

The extension listens for the [`agent_end`](https://pi.dev/docs/extensions#agent_start--agent_end) event and plays a sound using `afplay`.

The audio command is fire-and-forget so it never delays agent completion.

## Requirements

- **macOS** — `afplay` (built-in)

## License

MIT