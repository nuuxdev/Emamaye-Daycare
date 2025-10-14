export default function PreviewForm({
  savedStep,
}: {
  savedStep: Record<string, any>[];
}) {
  return (
    <div>
      <h2>Preview</h2>
      {JSON.stringify(savedStep, null, 2)}
      <button className="primary-button">Submit</button>
    </div>
  );
}
