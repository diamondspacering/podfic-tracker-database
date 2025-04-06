// this is for the schedule
export default function EventContent({ podfic }: { podfic: Podfic & Work }) {
  const { title, wordcount, rating, status, notes } = podfic;
  const blurb = notes?.find((note) => note.label === 'blurb');

  return (
    <div
      style={{
        maxWidth: '350px',
        textWrap: 'wrap',
      }}
    >
      <span>{title}</span>
      <br />
      {/* TODO: coloring for rating */}
      <span>
        {wordcount},&nbsp;{rating}
        {`, ${status}`}
      </span>
      <br />
      {blurb && (
        <span>
          <b>blurb:</b>
          {` ${blurb?.value}`}
        </span>
      )}
    </div>
  );
}
