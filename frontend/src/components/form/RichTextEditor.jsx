import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import DOMPurify from "dompurify";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatClearIcon from "@mui/icons-material/FormatClear";

import { isValidHttpUrl } from "../../validators/url";

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "a"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

function sanitize(html) {
  return DOMPurify.sanitize(html ?? "", SANITIZE_CONFIG);
}

function FormatButton({ active, disabled, onClick, title, children }) {
  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          size="small"
          disabled={disabled}
          onClick={onClick}
          sx={{ bgcolor: active ? "action.selected" : "transparent", borderRadius: 1.5 }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}

/**
 * Rich text field built on Tiptap (proper document model + undo/redo
 * history) rather than raw contentEditable/execCommand. Output is
 * sanitized with DOMPurify on every update and on paste; the allowed
 * tag/attribute list intentionally excludes scripts, styles, and event
 * handler attributes.
 */
export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing…",
  minHeight = 180,
  maxLength,
  disabled = false,
  label,
}) {
  const [linkAnchor, setLinkAnchor] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
      ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : []),
    ],
    content: sanitize(value),
    editable: !disabled,
    onUpdate: ({ editor: ed }) => onChange?.(sanitize(ed.getHTML())),
    editorProps: {
      attributes: { class: "tiptap-content" },
      transformPastedHTML: (html) => sanitize(html),
    },
  });

  // Keep the editor in sync with external `value` resets (e.g. a form
  // reset) without fighting the user's live edits mid-typing.
  useEffect(() => {
    if (!editor) return;
    const incoming = sanitize(value);
    if (!editor.isFocused && editor.getHTML() !== incoming) {
      editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters() ?? editor.getText().length;
  const isOverLimit = typeof maxLength === "number" && charCount > maxLength;

  const openLinkPopover = (e) => {
    if (disabled || editor.state.selection.empty) return;
    setLinkUrl(editor.getAttributes("link").href ?? "");
    setLinkAnchor(e.currentTarget);
  };

  const applyLink = () => {
    if (linkUrl.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkAnchor(null);
      return;
    }
    if (!isValidHttpUrl(linkUrl)) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.trim() }).run();
    setLinkAnchor(null);
  };

  return (
    <Box className="flex flex-col gap-1.5">
      {label && (
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
      )}

      <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", opacity: disabled ? 0.6 : 1 }}>
        <Box className="flex flex-wrap items-center gap-0.5 px-1.5 py-1" sx={{ bgcolor: "background.default" }}>
          <FormatButton active={editor.isActive("paragraph")} disabled={disabled} title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()}>
            P
          </FormatButton>
          <FormatButton active={editor.isActive("heading", { level: 2 })} disabled={disabled} title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            H2
          </FormatButton>
          <FormatButton active={editor.isActive("heading", { level: 3 })} disabled={disabled} title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            H3
          </FormatButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

          <FormatButton active={editor.isActive("bold")} disabled={disabled} title="Bold" onClick={() => editor.chain().focus().toggleBold().run()}>
            <FormatBoldIcon fontSize="small" />
          </FormatButton>
          <FormatButton active={editor.isActive("italic")} disabled={disabled} title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}>
            <FormatItalicIcon fontSize="small" />
          </FormatButton>
          <FormatButton active={editor.isActive("underline")} disabled={disabled} title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <FormatUnderlinedIcon fontSize="small" />
          </FormatButton>
          <FormatButton active={editor.isActive("strike")} disabled={disabled} title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}>
            <StrikethroughSIcon fontSize="small" />
          </FormatButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

          <FormatButton active={editor.isActive("bulletList")} disabled={disabled} title="Bulleted list" onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <FormatListBulletedIcon fontSize="small" />
          </FormatButton>
          <FormatButton active={editor.isActive("orderedList")} disabled={disabled} title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <FormatListNumberedIcon fontSize="small" />
          </FormatButton>
          <FormatButton active={editor.isActive("blockquote")} disabled={disabled} title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <FormatQuoteIcon fontSize="small" />
          </FormatButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

          <FormatButton active={editor.isActive("link")} disabled={disabled} title="Add / edit link (select text first)" onClick={openLinkPopover}>
            <LinkIcon fontSize="small" />
          </FormatButton>
          <FormatButton active={false} disabled={disabled} title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>
            <LinkOffIcon fontSize="small" />
          </FormatButton>
          <FormatButton active={false} disabled={disabled} title="Clear formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
            <FormatClearIcon fontSize="small" />
          </FormatButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

          <FormatButton active={false} disabled={disabled || !editor.can().undo()} title="Undo" onClick={() => editor.chain().focus().undo().run()}>
            <UndoIcon fontSize="small" />
          </FormatButton>
          <FormatButton active={false} disabled={disabled || !editor.can().redo()} title="Redo" onClick={() => editor.chain().focus().redo().run()}>
            <RedoIcon fontSize="small" />
          </FormatButton>
        </Box>

        <Divider />

        <Box
          sx={{
            minHeight,
            px: 1.5,
            py: 1.25,
            "& .tiptap-content": { outline: "none", fontSize: 14, lineHeight: 1.7 },
            "& .tiptap-content p.is-editor-empty:first-of-type::before": {
              content: "attr(data-placeholder)",
              color: "text.disabled",
              float: "left",
              height: 0,
              pointerEvents: "none",
            },
            "& blockquote": { borderLeft: "3px solid", borderColor: "divider", pl: 2, ml: 0, color: "text.secondary", fontStyle: "italic" },
            "& ul, & ol": { pl: 3 },
            "& h2": { fontSize: "1.25rem", fontWeight: 700, my: 1 },
            "& h3": { fontSize: "1.1rem", fontWeight: 700, my: 1 },
            "& a": { color: "primary.main" },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>

      {typeof maxLength === "number" && (
        <Typography variant="caption" color={isOverLimit ? "error.main" : "text.secondary"} className="self-end">
          {charCount} / {maxLength}
        </Typography>
      )}

      <Popover open={!!linkAnchor} anchorEl={linkAnchor} onClose={() => setLinkAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Box className="p-3 flex flex-col gap-2" sx={{ width: 280 }}>
          <TextField
            size="small"
            autoFocus
            label="Link URL"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
            }}
            error={linkUrl.length > 0 && !isValidHttpUrl(linkUrl)}
            helperText={linkUrl.length > 0 && !isValidHttpUrl(linkUrl) ? "Must be a valid http(s) URL" : " "}
          />
          <Button size="small" variant="contained" onClick={applyLink} disabled={linkUrl.length > 0 && !isValidHttpUrl(linkUrl)}>
            {linkUrl.trim() === "" ? "Remove link" : "Insert link"}
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
