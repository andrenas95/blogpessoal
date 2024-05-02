/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Testes dos Módulos Usuário e Auth (e2e)', () => {
  let token: any;
  let id: any;
  let titulo: any;
  let texto: any;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: 'db_blogpessoal_test.db',
          entities: [__dirname + './../src/**/entities/*.entity.ts'],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('00 - Deve Cadastrar Usuario para testes', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: ' ',
      });
    expect(201);
  });

  it('00 - Deve Autenticar Usuario (Login)', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({
        usuario: 'root@root.com',
        senha: 'rootroot',
      });
    expect(200);

    token = resposta.body.token;
  });

  it('01 - Deve Cadastrar uma Postagem', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/postagens')
      .set('Authorization', `${token}`)
      .send({
        id: 1,
        titulo: 'Postagem Blog 01',
        texto: 'Texto da Postagem Blog 01',
      });
    expect(201);
    id = resposta.body.id;
    titulo = resposta.body.titulo;
    texto = resposta.body.texto;
  });

  it('02 - Deve Listar todos as Postagens', async () => {
    return request(app.getHttpServer())
      .get('/postagens')
      .set('Authorization', `${token}`)
      .send({})
      .expect(200);
  });

  it('03 - Deve Atualizar uma Postagem', async () => {
    return request(app.getHttpServer())
      .put('/postagens')
      .set('Authorization', `${token}`)
      .send({
        id: 1,
        titulo: 'Postagem da Turma JS04 - Atualizada!',
        texto: 'Texto da Postagem da Turma JS04 - Atualizada!',
      })
      .expect(200)
      .then((resposta) => {
        expect('Postagem da Turma JS04 - Atualizada!').toEqual(
          resposta.body.titulo,
        );
      });
  });

  it('04 - Deve Buscar uma Postagem por ID', async () => {
    return request(app.getHttpServer())
      .get(`/postagens/${id}`)
      .set('Authorization', `${token}`)
      .send({})
      .expect(200);
  });

  it('05 - Deve Apagar uma Postagem', async () => {
    return request(app.getHttpServer())
      .delete(`/postagens/${id}`)
      .set('Authorization', `${token}`)
      .send({})
      .expect(204);
  });
});
