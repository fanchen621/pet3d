"""
宠物大冒险 - Data Models
"""

import json
import random
from datetime import datetime

PET_TYPES = {
    'dragon': {
        'name': '龙宝宝',
        'element': 'fire',
        'base_hp': 120,
        'base_attack': 25,
        'base_defense': 18,
        'base_speed': 15,
        'base_special': 22,
        'skills': [
            {'name': '火焰吐息', 'power': 30, 'element': 'fire', 'unlock_level': 1},
            {'name': '烈焰冲撞', 'power': 45, 'element': 'fire', 'unlock_level': 10},
            {'name': '龙之怒', 'power': 60, 'element': 'fire', 'unlock_level': 20},
            {'name': '炎龙波', 'power': 80, 'element': 'fire', 'unlock_level': 35}
        ]
    },
    'fox': {
        'name': '冰晶狐',
        'element': 'ice',
        'base_hp': 100,
        'base_attack': 20,
        'base_defense': 20,
        'base_speed': 25,
        'base_special': 25,
        'skills': [
            {'name': '冰晶射线', 'power': 28, 'element': 'ice', 'unlock_level': 1},
            {'name': '冰封之息', 'power': 42, 'element': 'ice', 'unlock_level': 10},
            {'name': '暴风雪', 'power': 58, 'element': 'ice', 'unlock_level': 20},
            {'name': '绝对零度', 'power': 78, 'element': 'ice', 'unlock_level': 35}
        ]
    },
    'bear': {
        'name': '雷霆熊',
        'element': 'electric',
        'base_hp': 130,
        'base_attack': 28,
        'base_defense': 22,
        'base_speed': 12,
        'base_special': 18,
        'skills': [
            {'name': '雷电爪', 'power': 32, 'element': 'electric', 'unlock_level': 1},
            {'name': '电光一闪', 'power': 46, 'element': 'electric', 'unlock_level': 10},
            {'name': '十万伏特', 'power': 62, 'element': 'electric', 'unlock_level': 20},
            {'name': '雷神之锤', 'power': 82, 'element': 'electric', 'unlock_level': 35}
        ]
    },
    'rabbit': {
        'name': '花灵兔',
        'element': 'nature',
        'base_hp': 95,
        'base_attack': 18,
        'base_defense': 16,
        'base_speed': 28,
        'base_special': 28,
        'skills': [
            {'name': '藤鞭', 'power': 26, 'element': 'nature', 'unlock_level': 1},
            {'name': '花瓣风暴', 'power': 40, 'element': 'nature', 'unlock_level': 10},
            {'name': '光合作用', 'power': 0, 'element': 'nature', 'unlock_level': 15, 'heal': True},
            {'name': '大自然之力', 'power': 75, 'element': 'nature', 'unlock_level': 35}
        ]
    },
    'cat': {
        'name': '暗影猫',
        'element': 'dark',
        'base_hp': 90,
        'base_attack': 24,
        'base_defense': 15,
        'base_speed': 30,
        'base_special': 24,
        'skills': [
            {'name': '暗影爪', 'power': 30, 'element': 'dark', 'unlock_level': 1},
            {'name': '暗黑波动', 'power': 44, 'element': 'dark', 'unlock_level': 10},
            {'name': '影分身', 'power': 0, 'element': 'dark', 'unlock_level': 18, 'buff': 'evasion'},
            {'name': '黑暗之门', 'power': 85, 'element': 'dark', 'unlock_level': 35}
        ]
    },
    'angel': {
        'name': '光明天使',
        'element': 'light',
        'base_hp': 110,
        'base_attack': 20,
        'base_defense': 20,
        'base_speed': 20,
        'base_special': 30,
        'skills': [
            {'name': '圣光弹', 'power': 28, 'element': 'light', 'unlock_level': 1},
            {'name': '治愈之光', 'power': 0, 'element': 'light', 'unlock_level': 8, 'heal': True},
            {'name': '天堂之拳', 'power': 55, 'element': 'light', 'unlock_level': 20},
            {'name': '神圣审判', 'power': 82, 'element': 'light', 'unlock_level': 35}
        ]
    }
}

PERSONALITIES = [
    {'name': '勇敢', 'attack_mod': 1.1, 'defense_mod': 0.9, 'desc': '攻击+10%'},
    {'name': '稳重', 'attack_mod': 0.9, 'defense_mod': 1.1, 'desc': '防御+10%'},
    {'name': '急躁', 'attack_mod': 1.15, 'defense_mod': 0.85, 'desc': '攻击+15%，防御-15%'},
    {'name': '冷静', 'attack_mod': 0.95, 'defense_mod': 1.05, 'special_mod': 1.1, 'desc': '特攻+10%'},
    {'name': '活泼', 'speed_mod': 1.15, 'desc': '速度+15%'},
    {'name': '调皮', 'attack_mod': 1.05, 'speed_mod': 1.1, 'defense_mod': 0.9, 'desc': '攻击+5%，速度+10%'},
    {'name': '温柔', 'special_mod': 1.15, 'defense_mod': 0.95, 'desc': '特攻+15%'},
    {'name': '坚毅', 'defense_mod': 1.15, 'attack_mod': 0.95, 'desc': '防御+15%'}
]

EVOLUTION_NAMES = {
    'dragon': ['龙宝宝', '烈焰龙', '炎龙王'],
    'fox': ['冰晶狐', '霜雪狐', '冰魄仙狐'],
    'bear': ['雷霆熊', '雷暴熊', '雷神巨熊'],
    'rabbit': ['花灵兔', '花仙兔', '自然精灵'],
    'cat': ['暗影猫', '幽冥猫', '暗夜帝王'],
    'angel': ['光明天使', '圣光天使', '炽天使']
}

def calc_exp_to_next(level):
    """Calculate EXP needed for next level."""
    return int(50 * (level ** 1.5))

def calc_combat_power(pet_data):
    """Calculate combat power from pet attributes."""
    level = pet_data.get('level', 1)
    evolution = pet_data.get('evolution', 0)
    attack = pet_data.get('attack', 20)
    defense = pet_data.get('defense', 15)
    special = pet_data.get('special', 20)
    speed = pet_data.get('speed', 15)
    hp = pet_data.get('max_hp', 100)
    skills_count = len(pet_data.get('skills', []))
    
    cp = (level * 10) + (evolution * 100) + attack * 3 + defense * 2.5 + special * 3 + speed * 2 + hp * 0.5 + skills_count * 15
    return int(cp)

def create_pet(pet_type, name=None, level=1):
    """Create a new pet instance."""
    if pet_type not in PET_TYPES:
        raise ValueError(f"Unknown pet type: {pet_type}")
    
    template = PET_TYPES[pet_type]
    personality = random.choice(PERSONALITIES)
    
    if name is None:
        name = EVOLUTION_NAMES[pet_type][0]
    
    hp = int(template['base_hp'] * (1 + (level - 1) * 0.05))
    attack = int(template['base_attack'] * (1 + (level - 1) * 0.06))
    defense = int(template['base_defense'] * (1 + (level - 1) * 0.05))
    speed = int(template['base_speed'] * (1 + (level - 1) * 0.04))
    special = int(template['base_special'] * (1 + (level - 1) * 0.06))
    
    # Apply personality modifiers
    attack = int(attack * personality.get('attack_mod', 1.0))
    defense = int(defense * personality.get('defense_mod', 1.0))
    speed = int(speed * personality.get('speed_mod', 1.0))
    special = int(special * personality.get('special_mod', 1.0))
    
    skills = [s for s in template['skills'] if s['unlock_level'] <= level]
    
    pet_data = {
        'type': pet_type,
        'name': name,
        'level': level,
        'exp': 0,
        'exp_to_next': calc_exp_to_next(level),
        'hp': hp,
        'max_hp': hp,
        'attack': attack,
        'defense': defense,
        'speed': speed,
        'special': special,
        'mood': 100,
        'evolution': 0,
        'personality': personality,
        'skills': skills,
        'skin': 'default',
        'costume': {},
        'created_at': datetime.now().isoformat()
    }
    
    pet_data['combat_power'] = calc_combat_power(pet_data)
    
    return pet_data

def create_wild_pet(player_level):
    """Create a wild pet for PvE battles."""
    pet_type = random.choice(list(PET_TYPES.keys()))
    level = max(1, player_level + random.randint(-3, 3))
    level = min(level, 100)
    
    wild_pet = create_pet(pet_type, f'野生{PET_TYPES[pet_type]["name"]}', level)
    wild_pet['is_wild'] = True
    
    return wild_pet

def gain_exp(pet_data, amount):
    """Add EXP to pet, handle level ups."""
    leveled_up = False
    old_level = pet_data['level']
    
    pet_data['exp'] += amount
    
    while pet_data['exp'] >= pet_data['exp_to_next'] and pet_data['level'] < 100:
        pet_data['exp'] -= pet_data['exp_to_next']
        pet_data['level'] += 1
        pet_data['exp_to_next'] = calc_exp_to_next(pet_data['level'])
        leveled_up = True
        
        # Recalculate stats
        template = PET_TYPES[pet_data['type']]
        lvl = pet_data['level']
        
        pet_data['max_hp'] = int(template['base_hp'] * (1 + (lvl - 1) * 0.05))
        pet_data['hp'] = pet_data['max_hp']
        pet_data['attack'] = int(template['base_attack'] * (1 + (lvl - 1) * 0.06))
        pet_data['defense'] = int(template['base_defense'] * (1 + (lvl - 1) * 0.05))
        pet_data['speed'] = int(template['base_speed'] * (1 + (lvl - 1) * 0.04))
        pet_data['special'] = int(template['base_special'] * (1 + (lvl - 1) * 0.06))
        
        # Apply personality
        personality = pet_data.get('personality', {})
        pet_data['attack'] = int(pet_data['attack'] * personality.get('attack_mod', 1.0))
        pet_data['defense'] = int(pet_data['defense'] * personality.get('defense_mod', 1.0))
        pet_data['speed'] = int(pet_data['speed'] * personality.get('speed_mod', 1.0))
        pet_data['special'] = int(pet_data['special'] * personality.get('special_mod', 1.0))
        
        # Unlock new skills
        for skill in template['skills']:
            if skill['unlock_level'] == lvl:
                if not any(s['name'] == skill['name'] for s in pet_data['skills']):
                    pet_data['skills'].append(skill.copy())
        
        # Check evolution
        if lvl >= 20 and pet_data['evolution'] == 0:
            pet_data['evolution'] = 1
            pet_data['name'] = EVOLUTION_NAMES[pet_data['type']][1]
        elif lvl >= 50 and pet_data['evolution'] == 1:
            pet_data['evolution'] = 2
            pet_data['name'] = EVOLUTION_NAMES[pet_data['type']][2]
    
    pet_data['combat_power'] = calc_combat_power(pet_data)
    
    return {
        'pet': pet_data,
        'leveled_up': leveled_up,
        'old_level': old_level,
        'new_level': pet_data['level'],
        'evolved': pet_data['evolution'] > (0 if not leveled_up else -1)
    }
