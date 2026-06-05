from app.api.crud.base import CRUDBase
from models.programming import RoutineSplit
from schemas.programming import RoutineSplitCreate, RoutineSplitUpdate


routine_split_crud = CRUDBase[RoutineSplit, RoutineSplitCreate, RoutineSplitUpdate](
    RoutineSplit,
    "Routine split",
)
