"""
宠物大冒险 - SQLite Database Layer
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

        CREATE TABLE IF NOT EXISTS pets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
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
            FOREIGN KEY (player_id) REFERENCES player(id)
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
            (player_id, type, name, level, exp, exp_to_next, hp, max_hp,
             attack, defense, speed, special, mood, evolution, personality,
             skills, skin, costume, combat_power, is_active, created_at, updated_at)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)''', (
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
    row = conn.execute('SELECT * FROM pets WHERE player_id = 1 AND is_active = 1 LIMIT 1').fetchone()
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
    conn.execute('UPDATE pets SET is_active = 0 WHERE player_id = 1')
    conn.execute('UPDATE pets SET is_active = 1 WHERE id = ? AND player_id = 1', (pet_id,))
    conn.commit()
    conn.close()


def _row_to_pet(row):
    d = dict(row)
    d['personality'] = json.loads(d.get('personality', '{}'))
    d['skills'] = json.loads(d.get('skills', '[]'))
    d['costume'] = json.loads(d.get('costume', '{}'))
    return d


# ---- Inventory ----

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


# ---- Achievements ----

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


# ---- Battle History ----

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


# ---- Ranking ----

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
    conn.execute('DELETE FROM battle_history')
    conn.execute('DELETE FROM achievements')
    conn.execute('DELETE FROM inventory')
    conn.execute('DELETE FROM pets')
    conn.execute('DELETE FROM ranking_cache')
    conn.execute('DELETE FROM player')
    conn.commit()
    conn.close()
    create_player()
