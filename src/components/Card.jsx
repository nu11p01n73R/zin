export function Card({ card, flipped }) {
  return (
    <div className="card" data-flipped={flipped}>
      <div className="card-inner">
        <section className="face face-front" inert={flipped}>
          <div className="face-top">
            <span className="label">nederlands</span>
          </div>
          <p className="sentence" lang="nl">
            {card.nl}
          </p>
        </section>

        <section className="face face-back" inert={!flipped}>
          <div className="face-top">
            <span className="label">english</span>
          </div>
          <p className="sentence" lang="en">
            {card.en}
          </p>
          {card.tip ? <p className="tip">{card.tip}</p> : null}
        </section>
      </div>
    </div>
  );
}
