export interface NPCRelationship {
  npcId: string
  targetNpcId: string
  relationship: "friend" | "rival" | "family" | "acquaintance" | "crush" | "mentor"
  opinion: string
}

export const RELATIONSHIPS: NPCRelationship[] = [
  // Rosa (innkeeper) relationships
  { npcId: "innkeeper", targetNpcId: "gardener", relationship: "family", opinion: "Abuela Nube es como mi madre. La quiero mucho." },
  { npcId: "innkeeper", targetNpcId: "fishmonger", relationship: "friend", opinion: "Pedro es ruidoso pero tiene buen corazon. Le guardo comida." },
  { npcId: "innkeeper", targetNpcId: "forest_ranger", relationship: "acquaintance", opinion: "Silvestre es muy callado. A veces trae flores del bosque." },

  // Pedro (fishmonger) relationships
  { npcId: "fishmonger", targetNpcId: "beach_fisherman", relationship: "rival", opinion: "Viejo Mar MIENTE sobre sus pescados! Los mios son MEJORES!" },
  { npcId: "fishmonger", targetNpcId: "beach_surfer", relationship: "acquaintance", opinion: "Olas es buen chico, pero deberia pescar en vez de surfear." },
  { npcId: "fishmonger", targetNpcId: "farm_owner", relationship: "rival", opinion: "Dona Tierra dice que la tierra es mejor que el mar. ESTA LOCA!" },

  // Lola (fruit_seller) relationships
  { npcId: "fruit_seller", targetNpcId: "shopkeeper", relationship: "crush", opinion: "Memo es tan tierno cuando se pone nervioso... me gusta molestarlo." },
  { npcId: "fruit_seller", targetNpcId: "farm_owner", relationship: "acquaintance", opinion: "Dona Tierra me vende la mejor fruta. Es dura pero justa." },
  { npcId: "fruit_seller", targetNpcId: "hotspring_poet", relationship: "acquaintance", opinion: "Don Verso me escribe poemas... es un poco raro pero dulce." },

  // El Filosofo (baker) relationships
  { npcId: "baker", targetNpcId: "shrine_priestess", relationship: "friend", opinion: "Serena entiende la filosofia del pan y la vida. Hablamos por horas." },
  { npcId: "baker", targetNpcId: "forest_hermit", relationship: "acquaintance", opinion: "El Ermitano y yo compartimos el gusto por la soledad y las preguntas." },

  // Gardener (Abuela Nube) relationships
  { npcId: "gardener", targetNpcId: "innkeeper", relationship: "family", opinion: "Rosa es como mi hija. Siempre me preocupo por ella." },
  { npcId: "gardener", targetNpcId: "forest_ranger", relationship: "friend", opinion: "Silvestre ama las plantas como yo. Es un buen muchacho." },
  { npcId: "gardener", targetNpcId: "farm_whisperer", relationship: "friend", opinion: "Susurro entiende a la naturaleza. Me recuerda a mi cuando era joven." },

  // Profesora Luna relationships
  { npcId: "school_teacher", targetNpcId: "school_bully", relationship: "mentor", opinion: "Chico finge que no le importa, pero yo se que tiene talento." },
  { npcId: "school_teacher", targetNpcId: "school_nerd", relationship: "mentor", opinion: "Librito es mi mejor estudiante. Algun dia escribira un gran libro." },

  // Chico (school_bully) relationships
  { npcId: "school_bully", targetNpcId: "school_nerd", relationship: "friend", opinion: "Librito es mi unico amigo real... pero no le digas a nadie." },
  { npcId: "school_bully", targetNpcId: "school_teacher", relationship: "acquaintance", opinion: "La Profesora Luna es estricta pero... creo que le importo." },

  // Librito (school_nerd) relationships
  { npcId: "school_nerd", targetNpcId: "school_bully", relationship: "friend", opinion: "Chico me protege de los demas. Es mas bueno de lo que parece." },

  // Don Verso (poet) relationships
  { npcId: "hotspring_poet", targetNpcId: "fruit_seller", relationship: "crush", opinion: "Lola... su nombre suena como musica. Algun dia le dare mi mejor poema." },
  { npcId: "hotspring_poet", targetNpcId: "hotspring_attendant", relationship: "friend", opinion: "Vapor entiende el arte de la calma. Buen companero de aguas termales." },

  // Olas (surfer) relationships
  { npcId: "beach_surfer", targetNpcId: "hotspring_attendant", relationship: "friend", opinion: "Vapor y yo entendemos el flow de la vida. Tranquilo, hermano." },
  { npcId: "beach_surfer", targetNpcId: "beach_fisherman", relationship: "acquaintance", opinion: "Viejo Mar cuenta historias locas. Me gusta escucharlo mientras espero olas." },

  // Viejo Mar (old fisherman) relationships
  { npcId: "beach_fisherman", targetNpcId: "fishmonger", relationship: "rival", opinion: "Pedro? Ese no sabe pescar! Yo atrape un pez de 3 metros una vez!" },

  // Serena (priestess) relationships
  { npcId: "shrine_priestess", targetNpcId: "baker", relationship: "friend", opinion: "El Filosofo entiende verdades profundas. Nuestras conversaciones iluminan el alma." },
  { npcId: "shrine_priestess", targetNpcId: "shrine_spirit", relationship: "family", opinion: "Eco es travieso, pero es parte del santuario. Lo cuido como un hermano menor." },

  // Espanta (scarecrow) relationships
  { npcId: "farm_scarecrow", targetNpcId: "mysterious_cat", relationship: "friend", opinion: "El gato misterioso me visita por las noches. Hablamos de secretos del pueblo." },
  { npcId: "farm_scarecrow", targetNpcId: "farm_whisperer", relationship: "friend", opinion: "Susurro es el unico que sabe que estoy vivo. Guarda bien mi secreto." },

  // Dona Tierra (farm owner) relationships
  { npcId: "farm_owner", targetNpcId: "fishmonger", relationship: "rival", opinion: "Pedro dice que el mar da mas que la tierra. Que tontera!" },
  { npcId: "farm_owner", targetNpcId: "farm_whisperer", relationship: "acquaintance", opinion: "Susurro es buen trabajador. Habla raro con los animales, pero funciona." },
]

export function getRelationshipsFor(npcId: string): NPCRelationship[] {
  return RELATIONSHIPS.filter((r) => r.npcId === npcId)
}

export function getRelatedNpcIds(npcId: string): string[] {
  return RELATIONSHIPS
    .filter((r) => r.npcId === npcId)
    .map((r) => r.targetNpcId)
}
