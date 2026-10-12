import { NotebookIllustration } from "./NotebookIllustration";

export function NotebookEmptyState({ message, motif, className = "" }: {
  message: string; motif: "page" | "bookmark" | "path"; className?: string;
}) {
  return <div className={`notebook-empty ${className}`}>
    <NotebookIllustration motif={motif} />
    <p>{message}</p>
  </div>;
}
