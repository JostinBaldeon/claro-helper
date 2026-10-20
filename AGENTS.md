<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep operational rules in browser-safe library modules and verify them with colocated Bun tests; ticket parsing and template interpolation must remain local and independently testable.
- Store the active advisor and selected template on each local history entry; derive daily filters and personal metrics in the history library so saved work is attributed consistently and testable. Legacy entries infer the advisor only from an explicit SGA signature, never from the current session.
