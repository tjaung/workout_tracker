from app.api.crud.base import CRUDBase
from models.programming import Split
from schemas.programming import SplitCreate, SplitUpdate


split_crud = CRUDBase[Split, SplitCreate, SplitUpdate](Split, "Split")
