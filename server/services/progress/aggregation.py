from collections.abc import Callable, Iterable
from datetime import date, datetime, timedelta
from typing import TypeVar

from schemas.progress import AggregationPeriod, ProgressAggregatePoint

RowT = TypeVar("RowT")


def aggregate_time_series(
    rows: Iterable[RowT],
    *,
    date_getter: Callable[[RowT], date | datetime],
    metrics: dict[str, Callable[[list[RowT]], float | int | None]],
    period: AggregationPeriod,
) -> list[ProgressAggregatePoint]:
    grouped_rows: dict[date, list[RowT]] = {}

    for row in rows:
        period_start = _period_start(date_getter(row), period)
        grouped_rows.setdefault(period_start, []).append(row)

    return [
        ProgressAggregatePoint(
            period_start=period_start,
            values={name: metric(items) for name, metric in metrics.items()},
        )
        for period_start, items in sorted(grouped_rows.items(), key=lambda item: item[0])
    ]


def _period_start(value: date | datetime, period: AggregationPeriod) -> date:
    current_date = value.date() if isinstance(value, datetime) else value
    if period == "day":
        return current_date
    if period == "week":
        return current_date - timedelta(days=current_date.weekday())
    if period == "month":
        return current_date.replace(day=1)
    if period == "year":
        return current_date.replace(month=1, day=1)
    return current_date
