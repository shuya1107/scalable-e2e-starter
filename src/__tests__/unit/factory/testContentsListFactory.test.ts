import { describe, test, expect } from 'vitest';
import { testContentsListFactory } from '../../../factory/testContentsListFactory';
import { TestContentsListFactoryError } from '../../../error/errorIndex';

describe('testContentsListFactory', () => {
  describe('正常系', () => {
    test('正しいJSON構造の場合、string[][]を返す', () => {
      // 実際のtestContent.jsonを使用してテスト
      const result = testContentsListFactory();
      
      // 戻り値の型チェック
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // 各グループが配列であることを確認
      result.forEach((group) => {
        expect(Array.isArray(group)).toBe(true);
        // 各要素が文字列であることを確認
        group.forEach((item) => {
          expect(typeof item).toBe('string');
        });
      });
    });
  });

  describe('異常系', () => {
    // 注: 実際のJSONファイルを使用しているため、
    // モック化が必要な場合は別途設定が必要
    
    test('TestContentsListFactoryErrorを継承している', () => {
      expect(TestContentsListFactoryError.prototype).toBeInstanceOf(Error);
    });
  });
});
