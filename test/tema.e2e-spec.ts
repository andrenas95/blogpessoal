/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Testes dos Módulos Usuário e Auth (e2e)', () => {
  let token: any;
  let descricao: any = 1;
  let temaId: any;
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

  it('01 - Deve Cadastrar Tema', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/temas')
      .set('Authorization', `${token}`)
      .send({
        descricao: 'Nest',
      });
    expect(201);

    descricao = resposta.body.descricao;
    temaId = resposta.body.id;
  });

  it('02 - Deve Listar todos os Temas', async () => {
    return request(app.getHttpServer())
      .get('/temas')
      .set('Authorization', `${token}`)
      .send({})
      .expect(200);
  });

  it('03 - Deve Atualizar um Tema', async () => {
    return request(app.getHttpServer())
      .put('/temas')
      .set('Authorization', `${token}`)
      .send({
        id: 1,
        descricao: 'tema 1 - atualizado',
      })
      .expect(200)
      .then((resposta) => {
        expect('tema 1 - atualizado').toEqual(resposta.body.descricao);
      });
  });

  it('04 - Deve Buscar um Tema por ID', async () => {
    return request(app.getHttpServer())
      .get(`/temas/${temaId}`)
      .set('Authorization', `${token}`)
      .send({})
      .expect(200);
  });

  it('05 - Deve Apagar um Tema', async () => {
    return request(app.getHttpServer())
      .delete(`/temas/${temaId}`)
      .set('Authorization', `${token}`)
      .send({})
      .expect(204);
  });
});
