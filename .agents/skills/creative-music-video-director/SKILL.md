---
name: creative-music-video-director
description: Use this skill to translate song context, artist persona, motifs, rhythm, and emotional arc into a music-video direction contract.
---

# Creative Music Video Director

Use this skill to translate song context, artist persona, motifs, rhythm, and emotional arc into a music-video direction contract for storyboard and prompt work.

## When To Use

Use this skill when:

- The user is planning a music video, lyric visual, performance concept, or rhythm-driven sequence.
- The work needs motif systems, scene worlds, emotional progression, or persona continuity.
- Storyboard or video-prompt roles need a direction layer before shot writing.

Do not use this skill to treat music videos as ordinary commercial ads or to run production tools.

## Inputs

Required:

- `song_context`: lyrics, themes, tempo, mood, or structure provided by the user.
- `artist_or_subject_notes`: persona, identity cues, performance style, or constraints.
- `reference_pack`: visual or musical references with authority and suppression notes.

Optional:

- `format_constraints`: duration, aspect ratio, platform, or edit type.
- `copy_or_caption_locks`: lyric text, supers, or title-card copy.
- `production_constraints`: available locations, assets, or character rules.

## Outputs

Produce a Music Video Direction Contract with:

- emotional arc and motif system
- scene world and visual language
- rhythm, pacing, and transition logic
- persona and identity rules
- continuity anchors
- storyboard handoff notes

## Process

1. Read the song as structure and emotion, not just decoration.
2. Define motif logic that can repeat and evolve across scenes.
3. Tie visual escalation to rhythm, lyric, or emotional turn.
4. Protect artist or subject identity rules.
5. Prepare the contract for `storyboard-architect` or `video-prompting`.

## Decision Rules

- Use commercial framing only if the brief explicitly asks for campaign behavior.
- Prioritize emotional coherence over isolated visual moments.
- Keep symbolic motifs repeatable and observable.
- If lyrics or persona details are missing, label assumptions before building structure.

## Guardrails

- Do not invent rights, biographies, endorsements, or private identity facts.
- Do not quote long copyrighted lyrics unless the user supplied and approved the text for the task.
- Do not execute tools or create final video prompts.
- Do not ignore continuity anchors from the reference pack.

## Handoff

Review gate: `direction_fit`.

Hand off to `storyboard-architect` with:

- `music_video_direction`
- `emotional_arc`
- `motif_system`
- `persona_rules`
- `continuity_anchors`

## QA Checklist

- Emotional arc has a clear beginning, shift, and resolution.
- Motifs are tied to rhythm or meaning.
- Persona rules are concrete and respectful of the source.
- Scene world can be storyboarded.
- The output remains direction, not final prompt execution.
