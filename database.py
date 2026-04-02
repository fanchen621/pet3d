"""
宠物大冒险 - SQLite Database Layer
支持班级优化大师学生导入 + 积分深度联动
"""

import sqlite3
import json
import os
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
DB_PATH = os.path.join(DB_DIR, 'game.db')


def get_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    c.executescript('''
        CREATE TABLE IF NOT EXISTS player (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL DEFAULT '训练师',
            points INTEGER NOT NULL DEFAULT 0,
            total_points_earned INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            student_no TEXT DEFAULT '',
            gender TEXT DEFAULT '',
            original_points INTEGER NOT NULL DEFAULT 0,
            current_points INTEGER NOT NULL DEFAULT 0,
            total_earned INTEGER NOT NULL DEFAULT 0,
            total_spent INTEGER NOT NULL DEFAULT 0,
            pet_type TEXT DEFAULT '',
            pet_name TEXT DEFAULT '',
            pet_level INTEGER NOT NULL DEFAULT 0,
            pet_evolution INTEGER NOT NULL DEFAULT 0,
            pet_combat_power INTEGER NOT NULL DEFAULT 0,
            pet_data TEXT NOT NULL DEFAULT '{}',
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL DEFAULT 1,
            student_id INTEGER DEFAULT NULL,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            level INTEGER NOT NULL DEFAULT 1,
            exp INTEGER NOT NULL DEFAULT 0,
            exp_to_next INTEGER NOT NULL DEFAULT 50,
            hp INTEGER NOT NULL DEFAULT 100,
            max_hp INTEGER NOT NULL DEFAULT 100,
            attack INTEGER NOT NULL DEFAULT 20,
            defense INTEGER NOT NULL DEFAULT 15,
            speed INTEGER NOT NULL DEFAULT 15,
            special INTEGER NOT NULL DEFAULT 20,
            mood INTEGER NOT NULL DEFAULT 100,
            evolution INTEGER NOT NULL DEFAULT 0,
            personality TEXT NOT NULL DEFAULT '{}',
            skills TEXT NOT NULL DEFAULT '[]',
            skin TEXT NOT NULL DEFAULT 'default',
            costume TEXT NOT NULL DEFAULT '{}',
            combat_power INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (player_id) REFERENCES player(id),
            FOREIGN KEY (student_id) REFERENCES students(id)
        );

        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            item_id TEXT NOT NULL,
            item_data TEXT NOT NULL DEFAULT '{}',
            count INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            FOREIGN KEY (player_id) REFERENCES player(id),
            UNIQUE(player_id, item_id)
        );

        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            achievement_id TEXT NOT NULL,
            unlocked_at TEXT NOT NULL,
            FOREIGN KEY (player_id) REFERENCES player(id),
            UNIQUE(player_id, achievement_id)
        );

        CREATE TABLE IF NOT EXISTS battle_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            pet_id INTEGER NOT NULL,
            opponent_name TEXT NOT NULL,
            opponent_type TEXT NOT NULL,
            won INTEGER NOT NULL DEFAULT 0,
            exp_gained INTEGER NOT NULL DEFAULT 0,
            turns INTEGER NOT NULL DEFAULT 0,
            battle_mode TEXT NOT NULL DEFAULT 'pve',
            created_at TEXT NOT NULL,
            FOREIGN KEY (player_id) REFERENCES player(id)
        );

        CREATE TABLE IF NOT EXISTS ranking_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            player_name TEXT NOT NULL,
            pet_id INTEGER NOT NULL,
            pet_name TEXT NOT NULL,
            pet_type TEXT NOT NULL,
            level INTEGER NOT NULL,
            combat_power INTEGER NOT NULL,
            evolution INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS point_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            delta INTEGER NOT NULL,
            reason TEXT DEFAULT '',
            source TEXT DEFAULT 'manual',
            created_at TEXT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students(id)
        );
    ''')

    conn.commit()
    conn.close()


def get_player():
    conn = get_db()
    row = conn.execute('SELECT * FROM player WHERE id = 1').fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def create_player(name='训练师'):
    conn = get_db()
    now = datetime.now().isoformat()
    conn.execute(
        'INSERT OR IGNORE INTO player (id, name, points, total_points_earned, created_at, updated_at) VALUES (1, ?, 0, 0, ?, ?)',
        (name, now, now)
    )
    conn.commit()
    conn.close()
    return get_player()


def update_player(name=None, points_delta=None):
    conn = get_db()
    now = datetime.now().isoformat()
    if name is not None:
        conn.execute('UPDATE player SET name = ?, updated_at = ? WHERE id = 1', (name, now))
    if points_delta is not None:
        conn.execute(
            'UPDATE player SET points = points + ?, total_points_earned = total_points_earned + MAX(0, ?), updated_at = ? WHERE id = 1',
            (points_delta, points_delta, now)
        )
    conn.commit()
    conn.close()
    return get_player()


# ===== STUDENTS =====

def import_students(student_list):
    """Import students from Excel data. student_list: [{name, student_no, gender, points}]"""
    conn = get_db()
    now = datetime.now().isoformat()
    imported = 0
    updated = 0

    for s in student_list:
        name = s.get('name', '').strip()
        if not name:
            continue

        student_no = s.get('student_no', '')
        gender = s.get('gender', '')
        points = int(s.get('points', 0))

        existing = conn.execute(
            'SELECT id, current_points FROM students WHERE name = ? AND student_no = ?',
            (name, student_no)
        ).fetchone()

        if existing:
            # Update points (sync from Excel)
            old_points = existing['current_points']
            conn.execute(
                'UPDATE students SET original_points = ?, current_points = current_points + ?, total_earned = total_earned + MAX(0, ?), updated_at = ? WHERE id = ?',
                (points, max(0, points - old_points), max(0, points - old_points), now, existing['id'])
            )
            updated += 1
        else:
            conn.execute(
                '''INSERT INTO students
                   (name, student_no, gender, original_points, current_points, total_earned, is_active, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)''',
                (name, student_no, gender, points, points, points, now, now)
            )
            imported += 1

    conn.commit()
    conn.close()
    return {'imported': imported, 'updated': updated}


def get_all_students():
    conn = get_db()
    rows = conn.execute(
        'SELECT * FROM students WHERE is_active = 1 ORDER BY current_points DESC, name ASC'
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d['pet_data'] = json.loads(d.get('pet_data', '{}'))
        result.append(d)
    return result


def get_student(student_id):
    conn = get_db()
    row = conn.execute('SELECT * FROM students WHERE id = ?', (student_id,)).fetchone()
    conn.close()
    if row:
        d = dict(row)
        d['pet_data'] = json.loads(d.get('pet_data', '{}'))
        return d
    return None


def update_student_points(student_id, delta, reason='', source='manual'):
    """Add or subtract points for a student. Syncs to pet game."""
    conn = get_db()
    now = datetime.now().isoformat()

    conn.execute(
        'UPDATE students SET current_points = current_points + ?, total_earned = total_earned + MAX(0, ?), updated_at = ? WHERE id = ?',
        (delta, delta, now, student_id)
    )

    # Log the change
    conn.execute(
        'INSERT INTO point_logs (student_id, delta, reason, source, created_at) VALUES (?, ?, ?, ?, ?)',
        (student_id, delta, reason, source, now)
    )

    # Also update associated pet if exists
    student = get_student(student_id)
    if student and student.get('pet_data'):
        pet = student['pet_data']
        if pet and pet.get('id'):
            # Points affect pet mood positively
            if delta > 0:
                conn.execute(
                    'UPDATE pets SET mood = MIN(100, mood + ?) WHERE id = ?',
                    (min(delta // 2, 20), pet['id'])
                )

    conn.commit()
    conn.close()
    return get_student(student_id)


def assign_pet_to_student(student_id, pet_type, pet_name=None):
    """Create a pet and assign it to a student."""
    import models
    conn = get_db()
    now = datetime.now().isoformat()

    student = get_student(student_id)
    if not student:
        return None

    pet_data = models.create_pet(pet_type, pet_name)
    pet_data['student_id'] = student_id
    pet_data = save_pet(pet_data)

    conn.execute(
        'UPDATE students SET pet_type = ?, pet_name = ?, pet_level = 1, pet_evolution = 0, pet_combat_power = ?, pet_data = ?, updated_at = ? WHERE id = ?',
        (pet_type, pet_data['name'], pet_data.get('combat_power', 0), json.dumps(pet_data, ensure_ascii=False), now, student_id)
    )

    conn.commit()
    conn.close()
    return pet_data


def sync_student_pet(student_id):
    """Sync pet data back to student table."""
    conn = get_db()
    now = datetime.now().isoformat()

    pet = conn.execute(
        'SELECT * FROM pets WHERE student_id = ? AND is_active = 1 LIMIT 1', (student_id,)
    ).fetchone()

    if pet:
        pet_dict = dict(pet)
        pet_dict['personality'] = json.loads(pet_dict.get('personality', '{}'))
        pet_dict['skills'] = json.loads(pet_dict.get('skills', '[]'))
        pet_dict['costume'] = json.loads(pet_dict.get('costume', '{}'))

        conn.execute(
            'UPDATE students SET pet_type = ?, pet_name = ?, pet_level = ?, pet_evolution = ?, pet_combat_power = ?, pet_data = ?, updated_at = ? WHERE id = ?',
            (pet_dict['type'], pet_dict['name'], pet_dict['level'],
             pet_dict['evolution'], pet_dict.get('combat_power', 0),
             json.dumps(pet_dict, ensure_ascii=False), now, student_id)
        )

    conn.commit()
    conn.close()


def get_point_logs(student_id, limit=50):
    conn = get_db()
    rows = conn.execute(
        'SELECT * FROM point_logs WHERE student_id = ? ORDER BY created_at DESC LIMIT ?',
        (student_id, limit)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_classroom_stats():
    """Get overall classroom statistics."""
    conn = get_db()

    total_students = conn.execute('SELECT COUNT(*) as c FROM students WHERE is_active = 1').fetchone()['c']
    total_pets = conn.execute('SELECT COUNT(*) as c FROM pets WHERE student_id IS NOT NULL AND is_active = 1').fetchone()['c']
    avg_level_row = conn.execute('SELECT AVG(level) as avg_lv FROM pets WHERE student_id IS NOT NULL AND is_active = 1').fetchone()
    avg_level = round(avg_level_row['avg_lv'] or 0, 1)
    top_cp_row = conn.execute('SELECT MAX(combat_power) as top_cp FROM pets WHERE student_id IS NOT NULL AND is_active = 1').fetchone()
    top_cp = top_cp_row['top_cp'] or 0
    total_points = conn.execute('SELECT SUM(current_points) as total FROM students WHERE is_active = 1').fetchone()['total'] or 0

    conn.close()
    return {
        'total_students': total_students,
        'total_pets': total_pets,
        'avg_level': avg_level,
        'top_cp': top_cp,
        'total_points': total_points,
    }


def delete_student(student_id):
    conn = get_db()
    conn.execute('UPDATE students SET is_active = 0 WHERE id = ?', (student_id,))
    conn.execute('UPDATE pets SET is_active = 0 WHERE student_id = ?', (student_id,))
    conn.commit()
    conn.close()


# ===== PETS =====

def save_pet(pet_data):
    conn = get_db()
    now = datetime.now().isoformat()

    if 'id' in pet_data and pet_data['id']:
        conn.execute('''UPDATE pets SET
            type=?, name=?, level=?, exp=?, exp_to_next=?, hp=?, max_hp=?,
            attack=?, defense=?, speed=?, special=?, mood=?, evolution=?,
            personality=?, skills=?, skin=?, costume=?, combat_power=?,
            is_active=?, updated_at=?
            WHERE id=?''', (
            pet_data['type'], pet_data['name'], pet_data['level'],
            pet_data['exp'], pet_data['exp_to_next'], pet_data['hp'],
            pet_data['max_hp'], pet_data['attack'], pet_data['defense'],
            pet_data['speed'], pet_data['special'], pet_data.get('mood', 100),
            pet_data['evolution'],
            json.dumps(pet_data.get('personality', {}), ensure_ascii=False),
            json.dumps(pet_data.get('skills', []), ensure_ascii=False),
            pet_data.get('skin', 'default'),
            json.dumps(pet_data.get('costume', {}), ensure_ascii=False),
            pet_data.get('combat_power', 0),
            1 if pet_data.get('is_active', True) else 0,
            now, pet_data['id']
        ))
    else:
        cur = conn.execute('''INSERT INTO pets
            (player_id, student_id, type, name, level, exp, exp_to_next, hp, max_hp,
             attack, defense, speed, special, mood, evolution, personality,
             skills, skin, costume, combat_power, is_active, created_at, updated_at)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)''', (
            pet_data.get('student_id'),
            pet_data['type'], pet_data['name'], pet_data['level'],
            pet_data['exp'], pet_data['exp_to_next'], pet_data['hp'],
            pet_data['max_hp'], pet_data['attack'], pet_data['defense'],
            pet_data['speed'], pet_data['special'], pet_data.get('mood', 100),
            pet_data['evolution'],
            json.dumps(pet_data.get('personality', {}), ensure_ascii=False),
            json.dumps(pet_data.get('skills', []), ensure_ascii=False),
            pet_data.get('skin', 'default'),
            json.dumps(pet_data.get('costume', {}), ensure_ascii=False),
            pet_data.get('combat_power', 0),
            now, now
        ))
        pet_data['id'] = cur.lastrowid

    conn.commit()
    conn.close()

    # Update ranking cache
    update_ranking(pet_data)

    return pet_data


def get_active_pet():
    conn = get_db()
    row = conn.execute('SELECT * FROM pets WHERE player_id = 1 AND is_active = 1 AND student_id IS NULL LIMIT 1').fetchone()
    conn.close()
    if row:
        return _row_to_pet(row)
    return None


def get_all_pets():
    conn = get_db()
    rows = conn.execute('SELECT * FROM pets WHERE player_id = 1 ORDER BY combat_power DESC').fetchall()
    conn.close()
    return [_row_to_pet(r) for r in rows]


def get_pet_by_id(pet_id):
    conn = get_db()
    row = conn.execute('SELECT * FROM pets WHERE id = ? AND player_id = 1', (pet_id,)).fetchone()
    conn.close()
    if row:
        return _row_to_pet(row)
    return None


def set_active_pet(pet_id):
    conn = get_db()
    conn.execute('UPDATE pets SET is_active = 0 WHERE player_id = 1 AND student_id IS NULL')
    conn.execute('UPDATE pets SET is_active = 1 WHERE id = ? AND player_id = 1', (pet_id,))
    conn.commit()
    conn.close()


def _row_to_pet(row):
    d = dict(row)
    d['personality'] = json.loads(d.get('personality', '{}'))
    d['skills'] = json.loads(d.get('skills', '[]'))
    d['costume'] = json.loads(d.get('costume', '{}'))
    return d


# ===== Inventory =====

def get_inventory(player_id=1):
    conn = get_db()
    rows = conn.execute('SELECT * FROM inventory WHERE player_id = ? ORDER BY created_at', (player_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def add_inventory_item(player_id, item_id, item_data, count=1):
    conn = get_db()
    now = datetime.now().isoformat()
    existing = conn.execute(
        'SELECT * FROM inventory WHERE player_id = ? AND item_id = ?',
        (player_id, item_id)
    ).fetchone()

    if existing:
        conn.execute(
            'UPDATE inventory SET count = count + ? WHERE player_id = ? AND item_id = ?',
            (count, player_id, item_id)
        )
    else:
        conn.execute(
            'INSERT INTO inventory (player_id, item_id, item_data, count, created_at) VALUES (?, ?, ?, ?, ?)',
            (player_id, item_id, json.dumps(item_data, ensure_ascii=False), count, now)
        )

    conn.commit()
    conn.close()
    return get_inventory(player_id)


def use_inventory_item(player_id, item_id):
    conn = get_db()
    existing = conn.execute(
        'SELECT * FROM inventory WHERE player_id = ? AND item_id = ? AND count > 0',
        (player_id, item_id)
    ).fetchone()

    if not existing:
        conn.close()
        return False

    new_count = existing['count'] - 1
    if new_count <= 0:
        conn.execute('DELETE FROM inventory WHERE player_id = ? AND item_id = ?', (player_id, item_id))
    else:
        conn.execute(
            'UPDATE inventory SET count = ? WHERE player_id = ? AND item_id = ?',
            (new_count, player_id, item_id)
        )

    conn.commit()
    conn.close()
    return True


# ===== Achievements =====

def get_achievements(player_id=1):
    conn = get_db()
    rows = conn.execute('SELECT * FROM achievements WHERE player_id = ?', (player_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def unlock_achievement(player_id, achievement_id):
    conn = get_db()
    now = datetime.now().isoformat()
    try:
        conn.execute(
            'INSERT INTO achievements (player_id, achievement_id, unlocked_at) VALUES (?, ?, ?)',
            (player_id, achievement_id, now)
        )
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        conn.close()
        return False


# ===== Battle History =====

def add_battle_record(player_id, pet_id, opponent_name, opponent_type, won, exp_gained, turns, mode='pve'):
    conn = get_db()
    now = datetime.now().isoformat()
    conn.execute(
        '''INSERT INTO battle_history
           (player_id, pet_id, opponent_name, opponent_type, won, exp_gained, turns, battle_mode, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (player_id, pet_id, opponent_name, opponent_type, 1 if won else 0, exp_gained, turns, mode, now)
    )
    conn.commit()
    conn.close()


def get_battle_history(player_id=1, limit=20):
    conn = get_db()
    rows = conn.execute(
        'SELECT * FROM battle_history WHERE player_id = ? ORDER BY created_at DESC LIMIT ?',
        (player_id, limit)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ===== Ranking =====

def update_ranking(pet_data):
    conn = get_db()
    now = datetime.now().isoformat()
    player = get_player()
    player_name = player['name'] if player else '未知'

    conn.execute('DELETE FROM ranking_cache WHERE pet_id = ?', (pet_data['id'],))
    conn.execute(
        '''INSERT INTO ranking_cache
           (player_id, player_name, pet_id, pet_name, pet_type, level, combat_power, evolution, updated_at)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (player_name, pet_data['id'], pet_data['name'], pet_data['type'],
         pet_data['level'], pet_data.get('combat_power', 0), pet_data.get('evolution', 0), now)
    )
    conn.commit()
    conn.close()


def get_ranking(limit=50):
    conn = get_db()
    rows = conn.execute(
        'SELECT * FROM ranking_cache ORDER BY combat_power DESC LIMIT ?',
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def reset_game():
    conn = get_db()
    conn.execute('DELETE FROM point_logs')
    conn.execute('DELETE FROM battle_history')
    conn.execute('DELETE FROM achievements')
    conn.execute('DELETE FROM inventory')
    conn.execute('DELETE FROM pets')
    conn.execute('DELETE FROM ranking_cache')
    conn.execute('DELETE FROM students')
    conn.execute('DELETE FROM player')
    conn.commit()
    conn.close()
    create_player()
