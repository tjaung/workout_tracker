from app.api.crud.exercises.exercise import exercise_crud, list_exercises_with_details
from app.api.crud.exercises.exercise_muscle_group import exercise_muscle_group_crud
from app.api.crud.exercises.muscle_group import muscle_group_crud
from app.api.crud.exercises.record_type import record_type_crud

__all__ = [
    "exercise_crud",
    "list_exercises_with_details",
    "exercise_muscle_group_crud",
    "muscle_group_crud",
    "record_type_crud",
]
