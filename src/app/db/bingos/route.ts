import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const active = searchParams.get('active');
  let activeOnly = true;
  if (active === 'false') {
    activeOnly = false;
  }
  const restrictActive = activeOnly ? ` where active is true` : '';
  const queryString = `
    select * from bingo_card${restrictActive}
    order by created_at desc
  `;

  const client = await getDBClient();
  const cardResult = await client.query(queryString);
  let cards = cardResult.rows;

  const squares: BingoSquare[] = (
    await Promise.all(
      cards.flatMap((card) =>
        client.query(
          `select *,
            (select to_json(array_agg(row_to_json(p))) from
              (select podfic.podfic_id,description,title from bingo_square_podfic
                inner join podfic on bingo_square_podfic.podfic_id = podfic.podfic_id
                inner join work on podfic.work_id = work.work_id
              where
                bingo_square_podfic.bingo_card_id = bingo_square.bingo_card_id
                and bingo_square_podfic.row = bingo_square.row
                and bingo_square_podfic."column" = bingo_square."column")
              p) as podfics
            from bingo_square
            where
              bingo_card_id = $1;
        `,
          [card.bingo_card_id],
        ),
      ),
    )
  ).flatMap((result) => result.rows);

  cards = cards.map((card) => {
    const size = card.size;
    const rows = Array.from(Array(size).keys()).map((index) => {
      // these SHOULD be sorted. I think. I am writing this blind which I believe is unwise.
      const rowSquares = squares.filter(
        (square) =>
          square.bingo_card_id === card.bingo_card_id && square.row === index,
      );
      return rowSquares;
    });
    return {
      ...card,
      rows,
    };
  });

  return NextResponse.json(cards);
}
