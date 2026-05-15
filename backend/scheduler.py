from datetime import datetime, timedelta

def parse_time(t_str):
    if not t_str:
        return None
    try:
        return datetime.strptime(t_str, "%H:%M")
    except ValueError:
        return None

def format_time(dt):
    return dt.strftime("%H:%M")

def build_schedule(tasks, wake_time="07:00", slept_at="23:00"):
    wt = parse_time(wake_time)
    if not wt: wt = parse_time("07:00")
    wake_dt = datetime(2000, 1, 1, wt.hour, wt.minute)
    
    st = parse_time(slept_at)
    slept_dt = datetime(2000, 1, 1, st.hour, st.minute) if st else None
    
    schedule = []
    
    # 1. Insert fixed routines
    morning_end = wake_dt + timedelta(minutes=30)
    schedule.append({
        "name": "Morning Routine",
        "start_time": format_time(wake_dt),
        "end_time": format_time(morning_end),
        "priority": "none",
        "type": "routine",
        "is_fixed": True
    })
    
    breakfast_end = morning_end + timedelta(minutes=30)
    schedule.append({
        "name": "Breakfast",
        "start_time": format_time(morning_end),
        "end_time": format_time(breakfast_end),
        "priority": "none",
        "type": "routine",
        "is_fixed": True
    })
    
    lunch_start = datetime(2000, 1, 1, 13, 0)
    schedule.append({
        "name": "Lunch",
        "start_time": format_time(lunch_start),
        "end_time": format_time(lunch_start + timedelta(minutes=45)),
        "priority": "none",
        "type": "routine",
        "is_fixed": True
    })
    
    dinner_start = datetime(2000, 1, 1, 20, 0)
    schedule.append({
        "name": "Dinner",
        "start_time": format_time(dinner_start),
        "end_time": format_time(dinner_start + timedelta(minutes=45)),
        "priority": "none",
        "type": "routine",
        "is_fixed": True
    })
    
    if slept_dt and 1 <= slept_dt.hour <= 5:
        nap_start = datetime(2000, 1, 1, 14, 0)
        schedule.append({
            "name": "Power Nap",
            "start_time": format_time(nap_start),
            "end_time": format_time(nap_start + timedelta(minutes=25)),
            "priority": "none",
            "type": "routine",
            "is_fixed": True
        })
        
    # 2. Fixed user tasks
    dynamic_tasks = []
    for t in tasks:
        if t.get("is_fixed") and t.get("fixed_time"):
            ft = parse_time(t["fixed_time"])
            if ft:
                ft_dt = datetime(2000, 1, 1, ft.hour, ft.minute)
                schedule.append({
                    "name": t["name"],
                    "start_time": format_time(ft_dt),
                    "end_time": format_time(ft_dt + timedelta(minutes=60)),
                    "priority": t.get("priority", "medium"),
                    "type": t.get("type", "general"),
                    "is_fixed": True
                })
        else:
            dt_task = dict(t)
            dt_task["remaining"] = 60 # Assume 60 min duration
            dynamic_tasks.append(dt_task)
            
    # Sort dynamic tasks by priority
    priority_order = {"high": 0, "medium": 1, "low": 2, "none": 3}
    dynamic_tasks.sort(key=lambda x: priority_order.get(str(x.get("priority", "low")).lower(), 2))
    
    # Fill remaining free slots
    schedule.sort(key=lambda x: parse_time(x["start_time"]))
    
    end_of_day = datetime(2000, 1, 1, 23, 0)
    
    fixed_intervals = []
    for b in schedule:
        b_st = parse_time(b["start_time"])
        b_et = parse_time(b["end_time"])
        if b_st and b_et:
            fixed_intervals.append((datetime(2000,1,1,b_st.hour,b_st.minute), datetime(2000,1,1,b_et.hour,b_et.minute)))
        
    current_time = breakfast_end
    work_streak = 0
    final_schedule = list(schedule)
    
    while current_time < end_of_day and dynamic_tasks:
        overlapping = False
        for start_dt, end_dt in fixed_intervals:
            if start_dt <= current_time < end_dt:
                current_time = end_dt
                overlapping = True
                work_streak = 0
                break
        if overlapping:
            continue
            
        next_fixed_start = end_of_day
        for start_dt, end_dt in fixed_intervals:
            if start_dt >= current_time:
                if start_dt < next_fixed_start:
                    next_fixed_start = start_dt
                    
        free_duration = (next_fixed_start - current_time).total_seconds() / 60
        
        if free_duration <= 0:
            current_time = next_fixed_start
            continue
            
        if work_streak >= 90:
            if free_duration >= 15:
                break_end = current_time + timedelta(minutes=15)
                final_schedule.append({
                    "name": "Short Break",
                    "start_time": format_time(current_time),
                    "end_time": format_time(break_end),
                    "priority": "none",
                    "type": "routine",
                    "is_fixed": True
                })
                current_time = break_end
                work_streak = 0
                continue
            else:
                current_time = next_fixed_start
                work_streak = 0
                continue
                
        task = dynamic_tasks[0]
        time_until_break = 90 - work_streak
        
        alloc_time = min(free_duration, time_until_break, task["remaining"])
        
        if alloc_time <= 0:
            current_time = next_fixed_start
            continue
            
        task_end = current_time + timedelta(minutes=alloc_time)
        final_schedule.append({
            "name": task["name"],
            "start_time": format_time(current_time),
            "end_time": format_time(task_end),
            "priority": task.get("priority", "medium"),
            "type": task.get("type", "general"),
            "is_fixed": False
        })
        
        task["remaining"] -= alloc_time
        current_time = task_end
        work_streak += alloc_time
        
        if task["remaining"] <= 0:
            dynamic_tasks.pop(0)
            
    final_schedule.sort(key=lambda x: parse_time(x["start_time"]))
    
    return final_schedule
