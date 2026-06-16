-- Novas cartilhas - rodar no servidor de produção
-- Antes de rodar, verificar o MAX(id) das tabelas pra evitar conflito

-- Bio compartilhada (usada em resume_speaker de todas as cartilhas)
-- Maria Elisa Pimentel Piemonte: Possui graduação em Curso de Fisioterapia da Faculdade de Medicina
-- pela USP (1991), mestrado e doutorado em Neurociências e Comportamento pela USP.

-- 1. Apostila Amparo Nov 2017
INSERT INTO blog_blog (id, speaker, slug, publish, banner, posted, subcategory)
VALUES (80, 'Maria Elisa Pimentel Piemonte', 'apostila-amparo-2017', true, false, '2017-11-01', 'palestras');

INSERT INTO blog_blog_translation (id, language_code, title, body, date_time, resume_speaker, master_id, affiliation)
VALUES (80, 'pt-br',
  'Apostila AMPARO - Construir uma melhor qualidade de vida para pessoas com Parkinson no Brasil',
  'Apostila completa da Rede AMPARO que sintetiza as palestras oferecidas nos primeiros doze meses de atividades. Aborda temas como a missão da rede, formação de uma comunidade de pessoas com Doença de Parkinson, familiares, cuidadores e profissionais de saúde, além de resumos das palestras mensais sobre qualidade de vida, autocuidado e cuidado interprofissional. Coordenação: Profa. Maria Elisa Pimentel Piemonte. Iniciativa NeuroMat com apoio FAPESP.',
  '2017-11-01T00:00:00-03:00',
  'Possui graduação em Curso de Fisioterapia da Faculdade de Medicina pela Universidade de São Paulo (1991), mestrado em Neurociências e Comportamento pela Universidade de São Paulo (1998) e doutorado em Neurociências e Comportamento pela Universidade de São Paulo (2003). Atualmente é professor doutor da Universidade de São Paulo. Tem experiência na área de Fisioterapia e Neurociências, com ênfase em Neurologia, atuando principalmente nos seguintes temas: Doença de Parkinson, Fisioterapia, Aprendizagem sensório-motora e cognição. Coordena o Curso de Especialização de Fisioterapia em Neurologia do Hospital das Clinicas da Faculdade de Medicina da USP e o Programa de Residência Multiprofissional de Promoção à Saúde e Cuidado na Atenção Hospitalar - Área Adulto/Idoso.',
  80,
  'NeuroMat e Universidade de São Paulo');

INSERT INTO blog_lecturefile (id, file, blog_post_id)
VALUES (6, 'lecture/apostila-amparo-2017.pdf', 80);

-- 2. Higiene do sono
INSERT INTO blog_blog (id, speaker, slug, publish, banner, posted, subcategory)
VALUES (81, 'Maria Elisa Pimentel Piemonte', 'higiene-do-sono', true, false, CURRENT_DATE, 'palestras');

INSERT INTO blog_blog_translation (id, language_code, title, body, date_time, resume_speaker, master_id, affiliation)
VALUES (81, 'pt-br',
  'Higiene do Sono - Dicas para pessoas com Parkinson',
  'Cartilha com orientações práticas sobre higiene do sono para pessoas com Doença de Parkinson. Inclui dicas como: evitar estimulantes (café, chá, energéticos) à tarde e à noite, estabelecer um padrão regular de sono, cuidar da temperatura, luminosidade, ruído e umidade do quarto. Recomendada para pessoas com Parkinson com qualquer distúrbio do sono.',
  CURRENT_TIMESTAMP,
  'Possui graduação em Curso de Fisioterapia da Faculdade de Medicina pela Universidade de São Paulo (1991), mestrado em Neurociências e Comportamento pela Universidade de São Paulo (1998) e doutorado em Neurociências e Comportamento pela Universidade de São Paulo (2003). Atualmente é professor doutor da Universidade de São Paulo. Tem experiência na área de Fisioterapia e Neurociências, com ênfase em Neurologia, atuando principalmente nos seguintes temas: Doença de Parkinson, Fisioterapia, Aprendizagem sensório-motora e cognição. Coordena o Curso de Especialização de Fisioterapia em Neurologia do Hospital das Clinicas da Faculdade de Medicina da USP e o Programa de Residência Multiprofissional de Promoção à Saúde e Cuidado na Atenção Hospitalar - Área Adulto/Idoso.',
  81,
  'NeuroMat e Universidade de São Paulo');

INSERT INTO blog_lecturefile (id, file, blog_post_id)
VALUES (7, 'lecture/higiene-do-sono.pdf', 81);

-- 3. Hipotensão postural
INSERT INTO blog_blog (id, speaker, slug, publish, banner, posted, subcategory)
VALUES (82, 'Maria Elisa Pimentel Piemonte', 'hipotensao-postural', true, false, CURRENT_DATE, 'palestras');

INSERT INTO blog_blog_translation (id, language_code, title, body, date_time, resume_speaker, master_id, affiliation)
VALUES (82, 'pt-br',
  'Hipotensão Postural - Como saber se sofro de queda da pressão arterial em pé?',
  'Cartilha informativa sobre hipotensão postural (queda da pressão arterial ao ficar em pé) na Doença de Parkinson. Traz perguntas de autoavaliação: desmaios ou "apagões" recentes, tontura ao ficar em pé, distúrbios de visão (escurecimento, pontos pretos) e dificuldade em respirar ao levantar. Material de orientação para pacientes e cuidadores.',
  CURRENT_TIMESTAMP,
  'Possui graduação em Curso de Fisioterapia da Faculdade de Medicina pela Universidade de São Paulo (1991), mestrado em Neurociências e Comportamento pela Universidade de São Paulo (1998) e doutorado em Neurociências e Comportamento pela Universidade de São Paulo (2003). Atualmente é professor doutor da Universidade de São Paulo. Tem experiência na área de Fisioterapia e Neurociências, com ênfase em Neurologia, atuando principalmente nos seguintes temas: Doença de Parkinson, Fisioterapia, Aprendizagem sensório-motora e cognição. Coordena o Curso de Especialização de Fisioterapia em Neurologia do Hospital das Clinicas da Faculdade de Medicina da USP e o Programa de Residência Multiprofissional de Promoção à Saúde e Cuidado na Atenção Hospitalar - Área Adulto/Idoso.',
  82,
  'NeuroMat e Universidade de São Paulo');

INSERT INTO blog_lecturefile (id, file, blog_post_id)
VALUES (8, 'lecture/hipotensao-postural.pdf', 82);

-- 4. Rotina
INSERT INTO blog_blog (id, speaker, slug, publish, banner, posted, subcategory)
VALUES (83, 'Maria Elisa Pimentel Piemonte', 'rotina', true, false, CURRENT_DATE, 'palestras');

INSERT INTO blog_blog_translation (id, language_code, title, body, date_time, resume_speaker, master_id, affiliation)
VALUES (83, 'pt-br',
  'Vamos organizar a rotina para ter uma melhor qualidade de vida?',
  'Cartilha prática sobre organização de rotina para pessoas com Doença de Parkinson. Propõe um exercício de 3 dias (incluindo 1 no final de semana) para anotar o tempo gasto em atividades como tomar banho, se vestir, tomar café, fazer exercícios, ficar no celular e assistir TV. Organizar a rotina ajuda a reduzir estresse e frustração, melhorando a qualidade de vida.',
  CURRENT_TIMESTAMP,
  'Possui graduação em Curso de Fisioterapia da Faculdade de Medicina pela Universidade de São Paulo (1991), mestrado em Neurociências e Comportamento pela Universidade de São Paulo (1998) e doutorado em Neurociências e Comportamento pela Universidade de São Paulo (2003). Atualmente é professor doutor da Universidade de São Paulo. Tem experiência na área de Fisioterapia e Neurociências, com ênfase em Neurologia, atuando principalmente nos seguintes temas: Doença de Parkinson, Fisioterapia, Aprendizagem sensório-motora e cognição. Coordena o Curso de Especialização de Fisioterapia em Neurologia do Hospital das Clinicas da Faculdade de Medicina da USP e o Programa de Residência Multiprofissional de Promoção à Saúde e Cuidado na Atenção Hospitalar - Área Adulto/Idoso.',
  83,
  'NeuroMat e Universidade de São Paulo');

INSERT INTO blog_lecturefile (id, file, blog_post_id)
VALUES (9, 'lecture/rotina.pdf', 83);

-- 5. Saúde sexual
INSERT INTO blog_blog (id, speaker, slug, publish, banner, posted, subcategory)
VALUES (84, 'Maria Elisa Pimentel Piemonte', 'saude-sexual', true, false, CURRENT_DATE, 'palestras');

INSERT INTO blog_blog_translation (id, language_code, title, body, date_time, resume_speaker, master_id, affiliation)
VALUES (84, 'pt-br',
  'Vamos melhorar a intimidade com parceiro ou parceira?',
  'Cartilha sobre saúde sexual na Doença de Parkinson. Traz orientações como: manter expectativas reais e não se cobrar, aproveitar a intimidade física com ou sem penetração, experimentar praticar nos melhores períodos do dia (evitando o cansaço noturno), e valorizar o carinho e o toque como formas de intimidade. Material voltado para pacientes e seus parceiros(as).',
  CURRENT_TIMESTAMP,
  'Possui graduação em Curso de Fisioterapia da Faculdade de Medicina pela Universidade de São Paulo (1991), mestrado em Neurociências e Comportamento pela Universidade de São Paulo (1998) e doutorado em Neurociências e Comportamento pela Universidade de São Paulo (2003). Atualmente é professor doutor da Universidade de São Paulo. Tem experiência na área de Fisioterapia e Neurociências, com ênfase em Neurologia, atuando principalmente nos seguintes temas: Doença de Parkinson, Fisioterapia, Aprendizagem sensório-motora e cognição. Coordena o Curso de Especialização de Fisioterapia em Neurologia do Hospital das Clinicas da Faculdade de Medicina da USP e o Programa de Residência Multiprofissional de Promoção à Saúde e Cuidado na Atenção Hospitalar - Área Adulto/Idoso.',
  84,
  'NeuroMat e Universidade de São Paulo');

INSERT INTO blog_lecturefile (id, file, blog_post_id)
VALUES (10, 'lecture/saude-sexual.pdf', 84);
